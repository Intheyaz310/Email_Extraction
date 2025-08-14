#!/usr/bin/env python3
"""
Test script for the upgraded BERT-based job information extraction.
This demonstrates the improved accuracy of the new NLP pipeline.
"""

import logging
from text_processor import TextProcessor
from config import Config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_bert_extraction():
    """Test the BERT-based extraction with sample job emails."""
    
    # Initialize the text processor
    processor = TextProcessor()
    
    # Sample job emails for testing
    test_emails = [
        {
            "subject": "Senior Python Developer Position at TechCorp Inc.",
            "body": """
            Hi there,
            
            We are looking for a Senior Python Developer to join our team at TechCorp Inc. 
            This is a full-time position based in San Francisco, CA.
            
            Requirements:
            - 5+ years of experience with Python
            - Experience with Django, Flask, and FastAPI
            - Knowledge of AWS and Docker
            - Experience with machine learning and data science
            
            Salary range: $120,000 - $150,000 per year.
            
            Please apply by December 31, 2024.
            
            Best regards,
            HR Team
            """
        },
        {
            "subject": "Data Scientist Opportunity",
            "body": """
            Hello,
            
            Microsoft is hiring a Data Scientist for our Seattle office.
            This is a contract position with potential for full-time conversion.
            
            Skills needed:
            - Python, R, SQL
            - Machine Learning (scikit-learn, TensorFlow)
            - Statistical analysis
            - Data visualization (Tableau, Power BI)
            
            Experience: 3-5 years in data science or analytics.
            
            Compensation: $130k - $160k annually.
            
            Apply by January 15, 2025.
            
            Thanks,
            Microsoft Recruiting
            """
        },
        {
            "subject": "Frontend Developer - Remote",
            "body": """
            Greetings,
            
            We're seeking a Frontend Developer at Google for a remote position.
            This is a mid-level role in the technology industry.
            
            Required skills:
            - JavaScript, React, Angular, Vue.js
            - HTML5, CSS3, TypeScript
            - Git, Agile methodologies
            - REST APIs and GraphQL
            
            Location: Remote (US-based)
            Type: Full-time
            Experience: 2-4 years
            
            Salary: $100,000 - $130,000 per year.
            
            Deadline: February 1, 2025.
            
            Regards,
            Google HR
            """
        }
    ]
    
    print("🧪 Testing BERT-Based Job Information Extraction")
    print("=" * 60)
    
    for i, email in enumerate(test_emails, 1):
        print(f"\n📧 Test Email {i}: {email['subject']}")
        print("-" * 40)
        
        # Extract job information
        job_info = processor.extract_all_job_info(email['body'])
        
        # Display results
        print(f"🎯 Job Title: {job_info['job_title']}")
        print(f"🏢 Company: {job_info['company_name']}")
        print(f"📍 Location: {job_info['location']}")
        print(f"💼 Job Type: {job_info['job_type']}")
        print(f"📊 Seniority: {job_info['seniority_level']}")
        print(f"💰 Salary Range: ${job_info['min_salary']} - ${job_info['max_salary']}")
        print(f"📅 Deadline: {job_info['application_deadline']}")
        print(f"🔧 Skills: {', '.join(job_info['required_skills'][:5])}...")
        print(f"📝 Summary: {job_info['job_summary'][:100]}..." if job_info['job_summary'] else "📝 Summary: None")
        
        print()
    
    print("✅ BERT extraction test completed!")
    
    # Show configuration status
    print(f"\n⚙️  Configuration Status:")
    print(f"   - BERT Enabled: {Config.USE_BERT}")
    print(f"   - Confidence Threshold: {Config.CONFIDENCE_THRESHOLD}")
    print(f"   - Transformers Available: {hasattr(processor, 'ner_pipeline') and processor.ner_pipeline is not None}")

if __name__ == "__main__":
    test_bert_extraction() 