#!/usr/bin/env python3
"""
Simple test script to verify email connection without requiring all dependencies.
"""

import os
import imaplib
import ssl
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_basic_connection():
    """Test basic email connection."""
    print("🔍 Testing Basic Email Connection...")
    
    # Get credentials from environment
    email_address = os.getenv('EMAIL_ADDRESS')
    password = os.getenv('EMAIL_PASSWORD')
    imap_server = os.getenv('IMAP_SERVER', 'imap.gmail.com')
    imap_port = int(os.getenv('IMAP_PORT', '993'))
    
    if not email_address or not password:
        print("❌ Email credentials not found in .env file")
        print("Please make sure you have:")
        print("  - EMAIL_ADDRESS=your_email@gmail.com")
        print("  - EMAIL_PASSWORD=your_app_password")
        return False
    
    print(f"📧 Email: {email_address}")
    print(f"🌐 Server: {imap_server}:{imap_port}")
    print("🔐 Attempting connection...")
    
    try:
        # Create SSL context
        context = ssl.create_default_context()
        
        # Connect to IMAP server
        connection = imaplib.IMAP4_SSL(imap_server, imap_port, ssl_context=context)
        
        # Login
        connection.login(email_address, password)
        print("✅ Successfully connected and logged in!")
        
        # Test fetching emails
        connection.select('INBOX')
        _, message_numbers = connection.search(None, 'UNSEEN')
        
        if message_numbers[0]:
            email_count = len(message_numbers[0].split())
            print(f"📥 Found {email_count} unread emails")
        else:
            print("📥 No unread emails found")
        
        # Disconnect
        connection.logout()
        print("✅ Connection test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Check your email and password in .env file")
        print("2. Make sure you're using an App Password for Gmail")
        print("3. Check your internet connection")
        print("4. Verify IMAP is enabled in your email settings")
        return False

def main():
    """Main test function."""
    print("🚀 Basic Email Connection Test")
    print("=" * 40)
    
    success = test_basic_connection()
    
    if success:
        print("\n🎉 Basic connection test passed!")
        print("Your email credentials are working correctly.")
        print("\nNext steps:")
        print("1. Install required packages: pip install pandas openpyxl nltk beautifulsoup4")
        print("2. Run the full test: python test_email.py")
    else:
        print("\n❌ Basic connection test failed.")
        print("Please fix the issues above and try again.")

if __name__ == "__main__":
    main() 