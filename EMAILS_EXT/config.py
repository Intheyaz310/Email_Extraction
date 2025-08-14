import os
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for the email job extraction application."""
    
    # Email Configuration
    EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', '')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')
    IMAP_SERVER = os.getenv('IMAP_SERVER', 'imap.gmail.com')
    IMAP_PORT = int(os.getenv('IMAP_PORT', '993'))
    
    # Application Settings
    CHECK_INTERVAL_MINUTES = int(os.getenv('CHECK_INTERVAL_MINUTES', '5'))
    EXCEL_FILENAME = os.getenv('EXCEL_FILENAME', 'job_emails.xlsx')
    MAX_EMAILS_PER_CHECK = int(os.getenv('MAX_EMAILS_PER_CHECK', '50'))
    
    # NLP Model Settings
    USE_SPACY = os.getenv('USE_SPACY', 'true').lower() == 'true'
    USE_BERT = os.getenv('USE_BERT', 'true').lower() == 'true'
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.7'))
    
    # Job-related keywords for filtering
    JOB_KEYWORDS = [
        'job', 'position', 'opportunity', 'career', 'employment',
        'hiring', 'recruiting', 'vacancy', 'opening', 'role'
    ]
    
    # Skills keywords
    SKILLS_KEYWORDS = [
        'skills', 'requirements', 'qualifications', 'experience',
        'proficient', 'knowledge', 'expertise', 'technologies'
    ]
    
    # Salary keywords
    SALARY_KEYWORDS = [
        'salary', 'compensation', 'pay', 'wage', 'remuneration',
        'annual', 'yearly', 'monthly', 'hourly', 'rate'
    ]
    
    @classmethod
    def validate_config(cls) -> Dict[str, Any]:
        """Validate configuration and return any issues."""
        issues = {}
        
        if not cls.EMAIL_ADDRESS:
            issues['EMAIL_ADDRESS'] = 'Email address is required'
        
        if not cls.EMAIL_PASSWORD:
            issues['EMAIL_PASSWORD'] = 'Email password is required'
        
        if cls.CHECK_INTERVAL_MINUTES < 1:
            issues['CHECK_INTERVAL_MINUTES'] = 'Check interval must be at least 1 minute'
        
        return issues
    
    @classmethod
    def is_valid(cls) -> bool:
        """Check if configuration is valid."""
        return len(cls.validate_config()) == 0 