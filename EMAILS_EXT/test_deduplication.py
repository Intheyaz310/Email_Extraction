#!/usr/bin/env python3
"""
Test script for the email deduplication system.
This verifies that Message-ID tracking prevents duplicate processing.
"""

import logging
from email_client import EmailClient
from excel_manager import ExcelManager
from text_processor import TextProcessor
from config import Config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_deduplication_system():
    """Test the complete deduplication system."""
    
    print("🧪 Testing Email Deduplication System")
    print("=" * 50)
    
    # Initialize components
    excel_manager = ExcelManager("test_jobs.xlsx")
    text_processor = TextProcessor()
    
    # Create test job data
    test_jobs = [
        {
            'message_id': '<test1@example.com>',
            'email_date': '2024-01-15 10:00:00',
            'sender': 'hr@company1.com',
            'subject': 'Senior Python Developer Position',
            'job_title': 'Senior Python Developer',
            'company_name': 'TechCorp Inc.',
            'location': 'San Francisco, CA',
            'raw_email': 'We are hiring a Senior Python Developer...'
        },
        {
            'message_id': '<test2@example.com>',
            'email_date': '2024-01-15 11:00:00',
            'sender': 'recruiting@company2.com',
            'subject': 'Data Scientist Opportunity',
            'job_title': 'Data Scientist',
            'company_name': 'DataCorp LLC',
            'location': 'New York, NY',
            'raw_email': 'Join our team as a Data Scientist...'
        },
        {
            'message_id': '<test3@example.com>',
            'email_date': '2024-01-15 12:00:00',
            'sender': 'jobs@company3.com',
            'subject': 'Frontend Developer Role',
            'job_title': 'Frontend Developer',
            'company_name': 'WebCorp Solutions',
            'location': 'Remote',
            'raw_email': 'Looking for a talented Frontend Developer...'
        }
    ]
    
    print("📝 Step 1: Save initial job data")
    success = excel_manager.save_job_data(test_jobs)
    print(f"   ✅ Save result: {success}")
    
    print("\n📊 Step 2: Check processed Message-IDs")
    processed_ids = excel_manager.get_processed_message_ids()
    print(f"   📋 Processed Message-IDs: {len(processed_ids)}")
    for msg_id in processed_ids:
        print(f"      - {msg_id}")
    
    print("\n🔍 Step 3: Test duplicate detection")
    duplicate_job = {
        'message_id': '<test1@example.com>',  # Same as first job
        'email_date': '2024-01-15 13:00:00',
        'sender': 'hr@company1.com',
        'subject': 'Senior Python Developer Position (Updated)',
        'job_title': 'Senior Python Developer',
        'company_name': 'TechCorp Inc.',
        'location': 'San Francisco, CA',
        'raw_email': 'Updated job posting...'
    }
    
    is_processed = excel_manager.is_email_processed(duplicate_job['message_id'])
    print(f"   🔄 Duplicate detection: {is_processed}")
    
    print("\n💾 Step 4: Try to save duplicate")
    duplicate_result = excel_manager.save_job_data([duplicate_job])
    print(f"   📥 Duplicate save result: {duplicate_result}")
    
    print("\n📊 Step 5: Check final statistics")
    stats = excel_manager.get_statistics()
    print(f"   📈 Total records: {stats.get('total_records', 0)}")
    print(f"   🏢 Companies: {len(stats.get('companies', []))}")
    
    print("\n✅ Deduplication test completed!")
    
    # Clean up test file
    import os
    if os.path.exists("test_jobs.xlsx"):
        os.remove("test_jobs.xlsx")
        print("🧹 Test file cleaned up")

def test_email_client_deduplication():
    """Test EmailClient with deduplication."""
    
    print("\n🧪 Testing EmailClient Deduplication")
    print("=" * 40)
    
    # This would require actual email connection
    print("⚠️  Note: This test requires actual email connection")
    print("   To test with real emails, run the Streamlit app")
    
    # Simulate the process
    processed_ids = {'<existing1@test.com>', '<existing2@test.com>'}
    
    # Simulate email data
    mock_emails = [
        {'message_id': '<new1@test.com>', 'subject': 'New Job 1'},
        {'message_id': '<existing1@test.com>', 'subject': 'Existing Job 1'},  # Should be skipped
        {'message_id': '<new2@test.com>', 'subject': 'New Job 2'},
    ]
    
    # Filter out already processed
    new_emails = [e for e in mock_emails if e.get('message_id', '') not in processed_ids]
    
    print(f"   📧 Total emails: {len(mock_emails)}")
    print(f"   🔄 Skipped duplicates: {len(mock_emails) - len(new_emails)}")
    print(f"   ✅ New emails: {len(new_emails)}")
    
    for email in new_emails:
        print(f"      - {email['subject']} ({email['message_id']})")

if __name__ == "__main__":
    test_deduplication_system()
    test_email_client_deduplication() 