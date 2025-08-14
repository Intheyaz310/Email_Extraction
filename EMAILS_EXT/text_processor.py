import re
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.tag import pos_tag

# Hugging Face imports for NER
try:
    from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: transformers or torch not available. BERT features will be disabled.")

from config import Config

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

class TextProcessor:
    """Text processing utilities for cleaning and extracting job information from emails using advanced NLP."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.stop_words = set(stopwords.words('english'))
        
        # Initialize NER pipeline if BERT is enabled
        self.ner_pipeline = None
        if Config.USE_BERT and TRANSFORMERS_AVAILABLE:
            try:
                self.logger.info("Initializing BERT NER pipeline...")
                self.ner_pipeline = pipeline(
                    "ner",
                    model="dslim/bert-base-NER",
                    aggregation_strategy="simple",
                    device=0 if torch.cuda.is_available() else -1
                )
                self.logger.info("BERT NER pipeline initialized successfully")
            except Exception as e:
                self.logger.warning(f"Failed to initialize BERT NER pipeline: {e}. Falling back to regex patterns.")
                self.ner_pipeline = None
        elif Config.USE_BERT and not TRANSFORMERS_AVAILABLE:
            self.logger.warning("BERT is enabled but transformers/torch not available. Install with: pip install transformers torch")
        
        # Common email patterns to remove
        self.email_patterns = [
            r'From:.*?\n',
            r'To:.*?\n',
            r'Subject:.*?\n',
            r'Date:.*?\n',
            r'Reply-To:.*?\n',
            r'CC:.*?\n',
            r'BCC:.*?\n',
            r'Message-ID:.*?\n',
            r'X-Mailer:.*?\n',
            r'Content-Type:.*?\n',
            r'Content-Transfer-Encoding:.*?\n',
            r'MIME-Version:.*?\n',
        ]
        
        # Signature patterns
        self.signature_patterns = [
            r'--\s*\n.*',  # Standard signature separator
            r'Best regards,.*',
            r'Sincerely,.*',
            r'Thanks,.*',
            r'Thank you,.*',
            r'Regards,.*',
            r'Yours truly,.*',
            r'Kind regards,.*',
            r'Best wishes,.*',
            r'Cheers,.*',
            r'Take care,.*',
            r'All the best,.*',
        ]
        
        # Forwarded/replied email patterns
        self.forward_reply_patterns = [
            r'From:.*?Sent:.*?To:.*?Subject:.*?\n',  # Outlook format
            r'On.*?wrote:.*',  # Gmail format
            r'From:.*?Date:.*?To:.*?Subject:.*?\n',  # Generic format
            r'---------- Forwarded message ----------',
            r'---------- Original Message ----------',
            r'Begin forwarded message:',
            r'Original Message:',
        ]
        
        # Enhanced job title patterns for better extraction
        self.job_title_patterns = [
            r'(?:looking for|seeking|hiring|position for|role of|job as)\s+([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate|Architect|Consultant|Advisor|Coordinator|Supervisor|Administrator))',
            r'(?:position|role|job)\s+(?:as\s+)?([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate|Architect|Consultant|Advisor|Coordinator|Supervisor|Administrator))',
            r'([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate|Architect|Consultant|Advisor|Coordinator|Supervisor|Administrator))\s+(?:position|role|job)',
            r'(?:Senior|Junior|Lead|Principal|Staff)\s+([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate|Architect|Consultant|Advisor|Coordinator|Supervisor|Administrator))',
        ]
    
    def extract_entities_with_bert(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities using BERT NER model."""
        if not self.ner_pipeline or not text:
            return {}
        
        try:
            # Run NER on the text
            entities = self.ner_pipeline(text)
            
            # Group entities by type
            entity_groups = {
                'PERSON': [],
                'ORG': [],
                'LOC': [],
                'MISC': []
            }
            
            for entity in entities:
                if entity['score'] >= Config.CONFIDENCE_THRESHOLD:
                    entity_type = entity['entity_group']
                    entity_text = entity['word'].strip()
                    
                    if entity_type in entity_groups and entity_text not in entity_groups[entity_type]:
                        entity_groups[entity_type].append(entity_text)
            
            return entity_groups
            
        except Exception as e:
            self.logger.error(f"Error in BERT NER extraction: {e}")
            return {}
    
    def extract_job_title_bert(self, text: str) -> Optional[str]:
        """Extract job title using BERT NER and enhanced patterns."""
        if not text:
            return None
        
        # First try BERT NER for organizations and misc entities
        if self.ner_pipeline:
            entities = self.extract_entities_with_bert(text)
            
            # Look for job titles in MISC entities (often contain job titles)
            for misc_entity in entities.get('MISC', []):
                # Check if it looks like a job title
                if any(keyword in misc_entity.lower() for keyword in [
                    'engineer', 'developer', 'manager', 'analyst', 'specialist',
                    'coordinator', 'director', 'lead', 'senior', 'junior',
                    'associate', 'architect', 'consultant', 'advisor'
                ]):
                    return misc_entity
        
        # Fallback to enhanced regex patterns
        for pattern in self.job_title_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                title = match.group(1).strip()
                if len(title) > 3:  # Filter out very short matches
                    return title
        
        # Additional fallback: look for capitalized phrases that might be job titles
        sentences = sent_tokenize(text)
        for sentence in sentences:
            words = word_tokenize(sentence)
            tagged = pos_tag(words)
            
            # Look for proper nouns that might be job titles
            title_candidates = []
            for word, tag in tagged:
                if tag.startswith('NNP') and word.isupper():
                    title_candidates.append(word)
            
            if title_candidates:
                return ' '.join(title_candidates[:3])  # Limit to first 3 words
        
        return None
    
    def extract_company_name_bert(self, text: str) -> Optional[str]:
        """Extract company name using BERT NER."""
        if not text:
            return None
        
        # Use BERT NER for organization extraction
        if self.ner_pipeline:
            entities = self.extract_entities_with_bert(text)
            
            # Look for organizations
            for org in entities.get('ORG', []):
                # Filter out common non-company organizations
                if not any(keyword in org.lower() for keyword in [
                    'university', 'college', 'school', 'hospital', 'government',
                    'department', 'ministry', 'agency', 'bureau'
                ]):
                    return org
        
        # Fallback to regex patterns
        patterns = [
            r'(?:at|with|for|from)\s+([A-Z][A-Za-z\s&.,]+(?:Inc|Corp|LLC|Ltd|Company|Co|Group|Solutions|Systems|Technologies))',
            r'([A-Z][A-Za-z\s&.,]+(?:Inc|Corp|LLC|Ltd|Company|Co|Group|Solutions|Systems|Technologies))',
            r'(?:company|organization):\s*([A-Z][A-Za-z\s&.,]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                company = match.group(1).strip()
                if len(company) > 2:
                    return company
        
        return None
    
    def extract_location_bert(self, text: str) -> Optional[str]:
        """Extract location using BERT NER."""
        if not text:
            return None
        
        # Use BERT NER for location extraction
        if self.ner_pipeline:
            entities = self.extract_entities_with_bert(text)
            
            # Look for locations
            locations = entities.get('LOC', [])
            if locations:
                return locations[0]  # Return the first location found
        
        # Fallback to regex patterns
        patterns = [
            r'(?:location|based in|work from|office in)[:\s]+([A-Za-z\s,]+(?:City|State|Country|NY|CA|TX|FL|IL|PA|OH|GA|NC|MI|NJ|VA|WA|OR|CO|AZ|NV|UT|ID|MT|WY|ND|SD|NE|KS|OK|AR|LA|MS|AL|TN|KY|IN|MO|IA|MN|WI|MI|NY|MA|CT|RI|VT|NH|ME|DE|MD|DC))',
            r'([A-Za-z\s,]+(?:City|State|Country|NY|CA|TX|FL|IL|PA|OH|GA|NC|MI|NJ|VA|WA|OR|CO|AZ|NV|UT|ID|MT|WY|ND|SD|NE|KS|OK|AR|LA|MS|AL|TN|KY|IN|MO|IA|MN|WI|MI|NY|MA|CT|RI|VT|NH|ME|DE|MD|DC))',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                location = match.group(1).strip()
                if len(location) > 2:
                    return location
        
        return None
    
    def clean_email_text(self, text: str) -> str:
        """Clean email text by removing signatures, headers, and forwarded content."""
        if not text:
            return ""
        
        # Convert to string if needed
        text = str(text)
        
        # Remove email headers
        for pattern in self.email_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)
        
        # Remove signatures
        for pattern in self.signature_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove forwarded/replied content
        for pattern in self.forward_reply_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Remove multiple newlines and spaces
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def extract_job_title(self, text: str) -> Optional[str]:
        """Extract job title from text using pattern matching and NLP."""
        if not text:
            return None
        
        # Common job title patterns
        patterns = [
            r'(?:looking for|seeking|hiring|position for|role of|job as)\s+([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate))',
            r'(?:position|role|job)\s+(?:as\s+)?([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate))',
            r'([A-Z][a-z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate))\s+(?:position|role|job)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                title = match.group(1).strip()
                if len(title) > 3:  # Filter out very short matches
                    return title
        
        # Fallback: look for capitalized phrases that might be job titles
        sentences = sent_tokenize(text)
        for sentence in sentences:
            words = word_tokenize(sentence)
            tagged = pos_tag(words)
            
            # Look for proper nouns that might be job titles
            title_candidates = []
            for word, tag in tagged:
                if tag.startswith('NNP') and word.isupper():
                    title_candidates.append(word)
            
            if title_candidates:
                return ' '.join(title_candidates[:3])  # Limit to first 3 words
        
        return None
    
    def extract_years_experience(self, text: str) -> Optional[str]:
        """Extract years of experience requirement."""
        if not text:
            return None
        
        patterns = [
            r'(\d+)[\s-]*(?:years?|yrs?)\s+(?:of\s+)?experience',
            r'experience[:\s]+(\d+)[\s-]*(?:years?|yrs?)',
            r'(\d+)[\s-]*(?:years?|yrs?)\s+(?:in\s+)?(?:the\s+)?field',
            r'minimum\s+(\d+)[\s-]*(?:years?|yrs?)',
            r'at\s+least\s+(\d+)[\s-]*(?:years?|yrs?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract required skills from text."""
        if not text:
            return []
        
        skills = []
        
        # Common skill keywords
        skill_keywords = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'ai',
            'data science', 'excel', 'power bi', 'tableau', 'salesforce',
            'html', 'css', 'php', 'c++', 'c#', '.net', 'spring', 'django',
            'flask', 'fastapi', 'rest api', 'graphql', 'microservices'
        ]
        
        # Look for skills in text
        text_lower = text.lower()
        for skill in skill_keywords:
            if skill in text_lower:
                skills.append(skill.title())
        
        # Look for skills in specific sections
        skill_sections = [
            r'skills?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)',
            r'requirements?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)',
            r'qualifications?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)',
            r'technologies?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)',
        ]
        
        for pattern in skill_sections:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                # Extract individual skills from the section
                section_skills = re.findall(r'\b([A-Za-z][A-Za-z0-9\s+#]+?)\b', match)
                for skill in section_skills:
                    skill = skill.strip()
                    if len(skill) > 2 and skill.lower() in skill_keywords:
                        skills.append(skill.title())
        
        return list(set(skills))  # Remove duplicates
    
    def extract_company_name(self, text: str) -> Optional[str]:
        """Extract company name from text."""
        if not text:
            return None
        
        # Look for company patterns
        patterns = [
            r'(?:at|with|for|from)\s+([A-Z][A-Za-z\s&.,]+(?:Inc|Corp|LLC|Ltd|Company|Co|Group|Solutions|Systems|Technologies))',
            r'([A-Z][A-Za-z\s&.,]+(?:Inc|Corp|LLC|Ltd|Company|Co|Group|Solutions|Systems|Technologies))',
            r'(?:company|organization):\s*([A-Z][A-Za-z\s&.,]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                company = match.group(1).strip()
                if len(company) > 2:
                    return company
        
        return None
    
    def extract_job_type(self, text: str) -> Optional[str]:
        """Extract job type (full-time, part-time, contract, etc.)."""
        if not text:
            return None
        
        text_lower = text.lower()
        
        job_types = {
            'full-time': ['full time', 'fulltime', 'full-time', 'permanent'],
            'part-time': ['part time', 'parttime', 'part-time'],
            'contract': ['contract', 'contractor', 'contracting'],
            'temporary': ['temp', 'temporary', 'temporary position'],
            'internship': ['intern', 'internship', 'intern position'],
            'freelance': ['freelance', 'freelancer', 'consultant'],
        }
        
        for job_type, keywords in job_types.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return job_type
        
        return None
    
    def extract_industry(self, text: str) -> Optional[str]:
        """Extract industry from text."""
        if not text:
            return None
        
        industries = [
            'technology', 'healthcare', 'finance', 'education', 'retail',
            'manufacturing', 'consulting', 'marketing', 'sales', 'real estate',
            'media', 'entertainment', 'government', 'non-profit', 'automotive',
            'aerospace', 'energy', 'telecommunications', 'transportation'
        ]
        
        text_lower = text.lower()
        for industry in industries:
            if industry in text_lower:
                return industry.title()
        
        return None
    
    def extract_seniority_level(self, text: str) -> Optional[str]:
        """Extract seniority level from text."""
        if not text:
            return None
        
        text_lower = text.lower()
        
        levels = {
            'entry-level': ['entry level', 'entry-level', 'junior', 'beginner'],
            'mid-level': ['mid level', 'mid-level', 'intermediate', 'mid'],
            'senior': ['senior', 'experienced', 'lead'],
            'principal': ['principal', 'staff'],
            'manager': ['manager', 'management'],
            'director': ['director'],
            'executive': ['executive', 'vp', 'vice president', 'c-level', 'chief']
        }
        
        for level, keywords in levels.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return level
        
        return None
    
    def extract_job_summary(self, text: str) -> Optional[str]:
        """Extract job summary/description."""
        if not text:
            return None
        
        # Look for summary sections
        patterns = [
            r'(?:about|description|summary|overview)[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)',
            r'(?:we are|we\'re|our company|about us)[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 20:  # Minimum length for meaningful summary
                    return summary[:500]  # Limit length
        
        # Fallback: take first few sentences
        sentences = sent_tokenize(text)
        if sentences:
            summary = ' '.join(sentences[:3])  # First 3 sentences
            if len(summary) > 20:
                return summary[:500]
        
        return None
    
    def extract_deadline(self, text: str) -> Optional[str]:
        """Extract application deadline."""
        if not text:
            return None
        
        patterns = [
            r'(?:deadline|apply by|application deadline|closing date)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})',
            r'(?:deadline|apply by|application deadline|closing date)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'([A-Za-z]+\s+\d{1,2},?\s+\d{4})\s+(?:deadline|apply by|closing)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def extract_salary_range(self, text: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract minimum and maximum salary."""
        if not text:
            return None, None
        
        # Look for salary patterns
        patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*[-–—]\s*\$(\d{1,3}(?:,\d{3})*(?:k|K)?)',
            r'(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*[-–—]\s*(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:dollars?|USD)',
            r'salary[:\s]+(?:range\s+)?\$(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*[-–—]\s*\$(\d{1,3}(?:,\d{3})*(?:k|K)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                min_salary = match.group(1)
                max_salary = match.group(2)
                return min_salary, max_salary
        
        # Look for single salary values
        single_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:k|K)?)',
            r'(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*(?:dollars?|USD)',
        ]
        
        for pattern in single_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if len(matches) >= 2:
                return matches[0], matches[1]
            elif len(matches) == 1:
                return matches[0], None
        
        return None, None
    
    def extract_all_job_info(self, text: str) -> Dict[str, Any]:
        """Extract all job-related information from text using enhanced NLP and robust fallback."""
        cleaned_text = self.clean_email_text(text)
        min_salary, max_salary = self.extract_salary_range(cleaned_text)

        # --- Robust job title extraction ---
        job_title = self.extract_job_title_bert(cleaned_text)
        if not job_title:
            job_title = self.extract_job_title(cleaned_text)
        if not job_title:
            # Heuristic: look for lines with 'position', 'hiring', etc.
            for line in cleaned_text.splitlines():
                if any(word in line.lower() for word in ['position', 'hiring', 'role', 'opening', 'vacancy']):
                    job_title = line.strip()[:60]
                    break

        # --- Robust company extraction ---
        company_name = self.extract_company_name_bert(cleaned_text)
        if not company_name:
            company_name = self.extract_company_name(cleaned_text)
        if not company_name:
            # Heuristic: look for lines with 'company', 'organization', etc.
            for line in cleaned_text.splitlines():
                if any(word in line.lower() for word in ['company', 'organization', 'employer']):
                    company_name = line.strip()[:60]
                    break

        # --- Robust location extraction ---
        location = self.extract_location_bert(cleaned_text)
        if not location:
            # Heuristic: look for lines with 'location', 'based in', etc.
            for line in cleaned_text.splitlines():
                if any(word in line.lower() for word in ['location', 'based in', 'city', 'state', 'country']):
                    location = line.strip()[:60]
                    break

        return {
            'job_title': job_title,
            'years_experience': self.extract_years_experience(cleaned_text),
            'required_skills': self.extract_skills(cleaned_text),
            'company_name': company_name,
            'job_type': self.extract_job_type(cleaned_text),
            'industry': self.extract_industry(cleaned_text),
            'seniority_level': self.extract_seniority_level(cleaned_text),
            'job_summary': self.extract_job_summary(cleaned_text),
            'location': location,
            'application_deadline': self.extract_deadline(cleaned_text),
            'min_salary': min_salary,
            'max_salary': max_salary,
            'cleaned_text': cleaned_text
        } 