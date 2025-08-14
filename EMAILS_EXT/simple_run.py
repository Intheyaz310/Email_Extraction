#!/usr/bin/env python3
"""
Simple test script to run the Email Job Extractor without .env file issues
"""

import os
import sys

# Set environment variables directly
os.environ['EMAIL_ADDRESS'] = 'test@example.com'
os.environ['EMAIL_PASSWORD'] = 'test_password'
os.environ['IMAP_SERVER'] = 'imap.gmail.com'
os.environ['IMAP_PORT'] = '993'
os.environ['CHECK_INTERVAL_MINUTES'] = '5'
os.environ['EXCEL_FILENAME'] = 'job_emails.xlsx'
os.environ['MAX_EMAILS_PER_CHECK'] = '50'
os.environ['USE_SPACY'] = 'true'
os.environ['USE_BERT'] = 'true'
os.environ['CONFIDENCE_THRESHOLD'] = '0.7'

def test_imports():
    """Test if all modules can be imported successfully"""
    print("🧪 Testing imports...")
    
    try:
        from config import Config
        print("✅ Config imported successfully")
        
        from text_processor import TextProcessor
        print("✅ TextProcessor imported successfully")
        
        from email_client import EmailClient
        print("✅ EmailClient imported successfully")
        
        from excel_manager import ExcelManager
        print("✅ ExcelManager imported successfully")
        
        import streamlit as st
        print("✅ Streamlit imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_text_processing():
    """Test text processing functionality"""
    print("\n🧪 Testing text processing...")
    
    try:
        from text_processor import TextProcessor
        
        processor = TextProcessor()
        
        # Test with sample text
        sample_text = """
        We are hiring a Senior Python Developer at TechCorp Inc.
        This is a full-time position based in San Francisco, CA.
        Requirements: 5+ years of Python experience.
        Salary: $120,000 - $150,000 per year.
        """
        
        job_info = processor.extract_all_job_info(sample_text)
        
        print(f"✅ Job Title: {job_info.get('job_title', 'Not found')}")
        print(f"✅ Company: {job_info.get('company_name', 'Not found')}")
        print(f"✅ Location: {job_info.get('location', 'Not found')}")
        print(f"✅ Skills: {job_info.get('required_skills', [])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Text processing error: {e}")
        return False

def test_excel_manager():
    """Test Excel manager functionality"""
    print("\n🧪 Testing Excel manager...")
    
    try:
        from excel_manager import ExcelManager
        
        manager = ExcelManager("test_jobs.xlsx")
        
        # Test creating file
        if manager.create_excel_file():
            print("✅ Excel file created successfully")
        
        # Test statistics
        stats = manager.get_statistics()
        print(f"✅ Statistics: {stats}")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel manager error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Email Job Extractor - System Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import test failed. Please check your dependencies.")
        return
    
    # Test text processing
    if not test_text_processing():
        print("\n❌ Text processing test failed.")
        return
    
    # Test Excel manager
    if not test_excel_manager():
        print("\n❌ Excel manager test failed.")
        return
    
    print("\n✅ All tests passed! System is ready to run.")
    print("\n🎯 To run the full application:")
    print("   streamlit run app.py")
    
    # Ask if user wants to run the full app
    response = input("\n🤔 Do you want to run the full Streamlit app now? (y/n): ")
    if response.lower() in ['y', 'yes']:
        print("\n🚀 Starting Streamlit app...")
        os.system("streamlit run app.py")
    else:
        print("\n👋 Test completed. Run 'streamlit run app.py' when ready!")

if __name__ == "__main__":
    main() 