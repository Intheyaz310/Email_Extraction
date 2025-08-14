const logger = require('./logger');
const fetch = require('node-fetch');

// Mock text processing function that simulates the Python functionality
// In a real implementation, this would call the Python backend or use Node.js NLP libraries
async function extractJobInfo(text) {
  try {
    logger.info('Starting text extraction process');

    // Try AI microservice first
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001/extract';
    try {
      const aiResp = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (aiResp.ok) {
        const json = await aiResp.json();
        const d = json.data || {};
        logger.info('AI extraction succeeded');
        return {
          job_title: d.job_title || null,
          company_name: d.company_name || null,
          location: d.location || null,
          required_skills: d.required_skills || [],
          salary_range: d.min_salary && d.max_salary ? `${d.min_salary}-${d.max_salary}` : null,
          job_type: d.job_type || null,
          experience_level: d.seniority_level || null,
          confidence_score: 0.85,
          email: extractEmail(text),
          domain: extractDomain(text),
          extracted_at: new Date().toISOString()
        };
      }
      logger.warn(`AI service responded with status ${aiResp.status}`);
    } catch (e) {
      logger.warn(`AI service not available: ${e.message}`);
    }

    // Fallback to local mock
    const cleanedText = cleanText(text);
    const extractedData = {
      job_title: extractJobTitle(cleanedText),
      company_name: extractCompanyName(cleanedText),
      location: extractLocation(cleanedText),
      required_skills: extractRequiredSkills(cleanedText),
      salary_range: extractSalaryRange(cleanedText),
      job_type: extractJobType(cleanedText),
      experience_level: extractExperienceLevel(cleanedText),
      confidence_score: calculateConfidenceScore(cleanedText),
      email: extractEmail(cleanedText),
      domain: extractDomain(cleanedText),
      extracted_at: new Date().toISOString()
    };

    logger.info('Text extraction completed with fallback');
    return extractedData;

  } catch (error) {
    logger.error('Text extraction error:', error);
    throw error;
  }
}

function cleanText(text) {
  if (!text) return '';

  let cleaned = text;

  // Remove email headers
  const emailPatterns = [
    /From:.*?\n/gi,
    /To:.*?\n/gi,
    /Subject:.*?\n/gi,
    /Date:.*?\n/gi,
    /Reply-To:.*?\n/gi,
    /CC:.*?\n/gi,
    /BCC:.*?\n/gi,
    /Message-ID:.*?\n/gi,
    /X-Mailer:.*?\n/gi,
    /Content-Type:.*?\n/gi,
    /Content-Transfer-Encoding:.*?\n/gi,
    /MIME-Version:.*?\n/gi,
  ];

  emailPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove signatures
  const signaturePatterns = [
    /--\s*\n.*/s,
    /Best regards,.*/s,
    /Sincerely,.*/s,
    /Thanks,.*/s,
    /Thank you,.*/s,
    /Regards,.*/s,
    /Yours truly,.*/s,
    /Kind regards,.*/s,
    /Best wishes,.*/s,
    /Cheers,.*/s,
    /Take care,.*/s,
    /All the best,.*/s,
  ];

  signaturePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove forwarded/replied email patterns
  const forwardReplyPatterns = [
    /From:.*?Sent:.*?To:.*?Subject:.*?\n/s,
    /On.*?wrote:.*/s,
    /From:.*?Date:.*?To:.*?Subject:.*?\n/s,
    /---------- Forwarded message ----------/s,
    /---------- Original Message ----------/s,
  ];

  forwardReplyPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

function extractJobTitle(text) {
  const patterns = [
    /(?:We are hiring|Looking for|Seeking|Position available|Job opening|Career opportunity)[:\s]+([^.!?\n]+)/i,
    /(?:Title|Position|Role)[:\s]+([^.!?\n]+)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Manager|Analyst|Designer|Specialist|Coordinator|Assistant|Director|Lead|Senior|Junior))/i,
    /(?:Join our team as|Become our|We need a|Hiring for)[:\s]+([^.!?\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractCompanyName(text) {
  const patterns = [
    /(?:at|with|for|join)\s+([A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|LLC|Ltd|Company|Group|Solutions|Technologies|Systems))/i,
    /(?:Company|Organization|Team)[:\s]+([^.!?\n]+)/i,
    /([A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|LLC|Ltd|Company|Group|Solutions|Technologies|Systems))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractLocation(text) {
  const patterns = [
    /(?:Location|Based in|Office in|Work from|Remote|Hybrid)[:\s]+([^.!?\n]+)/i,
    /(?:in|at)\s+([A-Z][a-zA-Z\s,]+(?:CA|NY|TX|FL|IL|PA|OH|GA|NC|MI|NJ|VA|WA|AZ|CO|TN|IN|MA|MO|MD|MN|WI|AL|SC|LA|KY|OR|OK|CT|IA|MS|AR|KS|UT|NV|NM|NE|ID|WV|HI|NH|ME|MT|RI|SD|ND|AK|VT|WY|DC))/i,
    /([A-Z][a-zA-Z\s,]+(?:CA|NY|TX|FL|IL|PA|OH|GA|NC|MI|NJ|VA|WA|AZ|CO|TN|IN|MA|MO|MD|MN|WI|AL|SC|LA|KY|OR|OK|CT|IA|MS|AR|KS|UT|NV|NM|NE|ID|WV|HI|NH|ME|MT|RI|SD|ND|AK|VT|WY|DC))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractRequiredSkills(text) {
  const skills = [];
  const skillPatterns = [
    /(?:Requirements|Skills|Qualifications|Must have|Required)[:\s]+([^.!?\n]+)/gi,
    /(?:Experience with|Knowledge of|Proficiency in|Familiarity with)[:\s]+([^.!?\n]+)/gi,
    /(?:Python|JavaScript|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|TypeScript|React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|AWS|Azure|GCP|Docker|Kubernetes|Git|SQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|Machine Learning|AI|Data Science|DevOps|Agile|Scrum)/gi,
  ];

  skillPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const skillList = match[1].split(/[,;]/).map(s => s.trim());
        skills.push(...skillList.filter(s => s.length > 2));
      }
    }
  });

  // Remove duplicates and return unique skills
  return [...new Set(skills)].slice(0, 10);
}

function extractSalaryRange(text) {
  const patterns = [
    /(?:Salary|Compensation|Pay)[:\s]+([$]?\d{1,3}(?:,\d{3})*(?:-\d{1,3}(?:,\d{3})*)?\s*(?:per\s+)?(?:year|month|hour|annually|monthly|hourly))/i,
    /([$]?\d{1,3}(?:,\d{3})*(?:-\d{1,3}(?:,\d{3})*)?\s*(?:per\s+)?(?:year|month|hour|annually|monthly|hourly))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractJobType(text) {
  const patterns = [
    /(?:Job Type|Employment Type|Work Type|Schedule)[:\s]+([^.!?\n]+)/i,
    /(?:Full-time|Part-time|Contract|Temporary|Internship|Freelance|Remote|Hybrid|On-site)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Default detection
  if (text.match(/full.?time/i)) return 'Full-time';
  if (text.match(/part.?time/i)) return 'Part-time';
  if (text.match(/contract/i)) return 'Contract';
  if (text.match(/remote/i)) return 'Remote';
  if (text.match(/hybrid/i)) return 'Hybrid';

  return null;
}

function extractExperienceLevel(text) {
  const patterns = [
    /(?:Experience|Years of Experience|Level)[:\s]+([^.!?\n]+)/i,
    /(\d+\+?\s+years?\s+of?\s+experience)/i,
    /(?:Entry.?level|Junior|Mid.?level|Senior|Lead|Principal|Architect)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Default detection
  if (text.match(/entry.?level|junior/i)) return 'Entry-level';
  if (text.match(/mid.?level/i)) return 'Mid-level';
  if (text.match(/senior|lead|principal|architect/i)) return 'Senior';

  return null;
}

function extractEmail(text) {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailPattern);
  return match ? match[0] : null;
}

function extractDomain(text) {
  const email = extractEmail(text);
  if (email) {
    return email.split('@')[1];
  }
  return null;
}

function calculateConfidenceScore(text) {
  let score = 0.5; // Base score

  // Increase score based on found information
  if (extractJobTitle(text)) score += 0.15;
  if (extractCompanyName(text)) score += 0.1;
  if (extractLocation(text)) score += 0.1;
  if (extractRequiredSkills(text).length > 0) score += 0.1;
  if (extractSalaryRange(text)) score += 0.05;
  if (extractJobType(text)) score += 0.05;
  if (extractExperienceLevel(text)) score += 0.05;

  // Text quality factors
  if (text.length > 100) score += 0.05;
  if (text.length > 500) score += 0.05;

  // Cap at 0.95
  return Math.min(score, 0.95);
}

module.exports = {
  extractJobInfo,
  cleanText,
  extractJobTitle,
  extractCompanyName,
  extractLocation,
  extractRequiredSkills,
  extractSalaryRange,
  extractJobType,
  extractExperienceLevel,
  extractEmail,
  extractDomain,
  calculateConfidenceScore
};
