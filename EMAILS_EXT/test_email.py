#!/usr/bin/env python3
"""
Test script to verify email connection and job extraction functionality.
"""

import logging
from datetime import datetime
from email_client import EmailClient
from text_processor import TextProcessor
from excel_manager import ExcelManager
from config import Config

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_email_connection():
    """Test email connection and fetch a few unread emails."""
    print("🔍 Testing Email Connection...")
    
    # Validate configuration
    issues = Config.validate_config()
    if issues:
        print("❌ Configuration issues found:")
        for field, issue in issues.items():
            print(f"   - {field}: {issue}")
        return False
    
    print("✅ Configuration is valid")
    
    # Test email connection
    email_client = EmailClient()
    
    print(f"📧 Connecting to {Config.IMAP_SERVER}...")
    if not email_client.connect():
        print("❌ Failed to connect to email server")
        return False
    
    print("✅ Successfully connected to email server")
    
    # Fetch unread emails
    print("📥 Fetching unread emails...")
    emails = email_client.fetch_unread_emails(max_emails=5)
    
    if not emails:
        print("ℹ️  No unread emails found")
        email_client.disconnect()
        return True
    
    print(f"✅ Found {len(emails)} unread emails")
    
    # Process emails
    print("🔧 Processing emails for job information...")
    text_processor = TextProcessor()
    job_data = []
    
    for i, email_data in enumerate(emails, 1):
        print(f"\n📧 Processing email {i}/{len(emails)}")
        print(f"   Subject: {email_data['subject'][:50]}...")
        print(f"   From: {email_data['sender']}")
        
        # Extract job information
        job_info = text_processor.extract_all_job_info(email_data['body'])
        
        # Add email metadata
        job_info.update({
            'email_date': email_data['date'],
            'sender': email_data['sender'],
            'subject': email_data['subject']
        })
        
        # Check if this looks like a job email
        if job_info['job_title'] or job_info['company_name']:
            print(f"   ✅ Job information extracted:")
            if job_info['job_title']:
                print(f"      Job Title: {job_info['job_title']}")
            if job_info['company_name']:
                print(f"      Company: {job_info['company_name']}")
            if job_info['location']:
                print(f"      Location: {job_info['location']}")
            job_data.append(job_info)
        else:
            print(f"   ℹ️  No job information detected")
    
    # Save to Excel if job data found
    if job_data:
        print(f"\n💾 Saving {len(job_data)} job records to Excel...")
        excel_manager = ExcelManager()
        if excel_manager.save_job_data(job_data):
            print("✅ Job data saved successfully!")
            
            # Show statistics
            stats = excel_manager.get_statistics()
            print(f"📊 Total records in Excel: {stats['total_records']}")
        else:
            print("❌ Failed to save job data")
    else:
        print("ℹ️  No job-related emails found")
    
    # Clean up
    email_client.disconnect()
    print("\n✅ Test completed successfully!")
    return True

def main():
    """Main test function."""
    print("🚀 Email Job Extraction Test")
    print("=" * 50)
    
    try:
        success = test_email_connection()
        if success:
            print("\n🎉 All tests passed! Your email extraction system is working.")
        else:
            print("\n❌ Tests failed. Please check your configuration and try again.")
    except Exception as e:
        print(f"\n💥 Test failed with error: {str(e)}")
        print("Please check your configuration and internet connection.")

if __name__ == "__main__":
    main() 