#!/usr/bin/env python3
"""
Run the Streamlit app with user's email credentials
"""

import os
import subprocess
import sys

def main():
    """Set up environment and run the app"""
    
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
    
    print("🚀 Starting Email Job Extractor with your credentials...")
    print(f"📧 Email: saiteja.puttapaka@spsu.ac.in")
    print("🔐 Using App Password")
    print("\n🌐 The app will open in your browser at: http://localhost:8501")
    print("📋 Your extracted job data will be saved to: job_emails.xlsx")
    print("\n⏳ Starting Streamlit app...")
    
    # Run the Streamlit app
    try:
        subprocess.run([sys.executable, "-m", "streamlit", "run", "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n👋 App stopped by user")
    except Exception as e:
        print(f"\n❌ Error running app: {e}")

if __name__ == "__main__":
    main() 