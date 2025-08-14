#!/usr/bin/env python3
"""
Test script to test email extraction with user's credentials
"""

import os
import sys

# Set user's email credentials
os.environ['EMAIL_ADDRESS'] = 'saiteja.puttapaka@spsu.ac.in'
os.environ['EMAIL_PASSWORD'] = 'ufsz nfhr vppp boob'
os.environ['IMAP_SERVER'] = 'imap.gmail.com'
os.environ['IMAP_PORT'] = '993'
os.environ['CHECK_INTERVAL_MINUTES'] = '5'
os.environ['EXCEL_FILENAME'] = 'job_emails.xlsx'
os.environ['MAX_EMAILS_PER_CHECK'] = '50'
os.environ['USE_SPACY'] = 'true'
os.environ['USE_BERT'] = 'true'
os.environ['CONFIDENCE_THRESHOLD'] = '0.7'

def test_email_connection():
    """Test email connection with user's credentials"""
    print("🧪 Testing email connection...")
    
    try:
        from email_client import EmailClient
        
        email_client = EmailClient()
        
        print(f"📧 Connecting to: {email_client.imap_server}")
        print(f"📧 Email: {email_client.email_address}")
        
        if email_client.connect():
            print("✅ Email connection successful!")
            
            # Test fetching emails
            print("\n📥 Testing email fetch...")
            emails = email_client.fetch_unread_emails(max_emails=5)
            
            if emails:
                print(f"✅ Found {len(emails)} unread emails")
                
                # Show first email details
                if emails:
                    first_email = emails[0]
                    print(f"\n📧 First email:")
                    print(f"   Subject: {first_email.get('subject', 'No subject')}")
                    print(f"   From: {first_email.get('sender', 'Unknown')}")
                    print(f"   Date: {first_email.get('date', 'Unknown')}")
                    print(f"   Body length: {len(first_email.get('body', ''))} characters")
            else:
                print("ℹ️ No unread emails found")
            
            email_client.disconnect()
            return True, emails
            
        else:
            print("❌ Email connection failed!")
            return False, []
            
    except Exception as e:
        print(f"❌ Email connection error: {e}")
        return False, []

def test_job_extraction(emails):
    """Test job information extraction from emails"""
    print("\n🧪 Testing job extraction...")
    
    try:
        from text_processor import TextProcessor
        from excel_manager import ExcelManager
        
        processor = TextProcessor()
        excel_manager = ExcelManager()
        
        if not emails:
            print("ℹ️ No emails to process")
            return False
        
        job_data = []
        
        for i, email in enumerate(emails[:3]):  # Process first 3 emails
            print(f"\n📧 Processing email {i+1}: {email.get('subject', 'No subject')}")
            
            # Extract job information
            job_info = processor.extract_all_job_info(email.get('body', ''))
            
            # Add email metadata
            job_info.update({
                'email_date': email.get('date', ''),
                'sender': email.get('sender', ''),
                'subject': email.get('subject', ''),
                'message_id': email.get('message_id', ''),
                'raw_email': email.get('body', '')[:500] + "..."  # Truncate for display
            })
            
            # Check if it's a job email
            from app import EmailJobExtractorApp
            app = EmailJobExtractorApp()
            is_job_email = app._is_job_email(job_info, email)
            
            print(f"   🎯 Job Title: {job_info.get('job_title', 'Not found')}")
            print(f"   🏢 Company: {job_info.get('company_name', 'Not found')}")
            print(f"   📍 Location: {job_info.get('location', 'Not found')}")
            print(f"   💼 Job Type: {job_info.get('job_type', 'Not found')}")
            print(f"   🔧 Skills: {job_info.get('required_skills', [])}")
            print(f"   📊 Is Job Email: {'Yes' if is_job_email else 'No'}")
            
            if is_job_email:
                job_data.append(job_info)
        
        # Save to Excel
        if job_data:
            if excel_manager.save_job_data(job_data):
                print(f"\n✅ Successfully extracted and saved {len(job_data)} job(s) to Excel")
                return True
            else:
                print("\n❌ Failed to save job data to Excel")
                return False
        else:
            print("\nℹ️ No job emails found in the processed emails")
            return True
            
    except Exception as e:
        print(f"❌ Job extraction error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Email Job Extractor - User Credentials Test")
    print("=" * 60)
    print(f"📧 Email: saiteja.puttapaka@spsu.ac.in")
    print(f"🔐 Using App Password")
    print("=" * 60)
    
    # Test email connection
    connection_success, emails = test_email_connection()
    
    if not connection_success:
        print("\n❌ Email connection failed. Please check:")
        print("   1. Email address is correct")
        print("   2. App password is correct")
        print("   3. IMAP is enabled in Gmail settings")
        print("   4. 2-factor authentication is enabled")
        return
    
    # Test job extraction
    extraction_success = test_job_extraction(emails)
    
    if extraction_success:
        print("\n✅ All tests completed successfully!")
        print("\n🎯 Your email is now configured and ready to use.")
        print("\n🌐 To use the full application:")
        print("   python -m streamlit run app.py")
    else:
        print("\n❌ Job extraction test failed.")
        print("   This might be normal if your emails don't contain job-related content.")

if __name__ == "__main__":
    main() 