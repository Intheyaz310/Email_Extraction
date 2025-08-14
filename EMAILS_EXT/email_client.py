import imaplib
import email
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional, Tuple
import logging
from datetime import datetime, timedelta
import time

from config import Config

class EmailClient:
    """Email client for connecting to IMAP servers and fetching emails."""
    
    def __init__(self, imap_server=None, imap_port=None, email_address=None, password=None):
        from config import Config
        self.imap_server = imap_server if imap_server is not None else Config.IMAP_SERVER
        self.imap_port = imap_port if imap_port is not None else Config.IMAP_PORT
        self.email_address = email_address if email_address is not None else Config.EMAIL_ADDRESS
        self.password = password if password is not None else Config.EMAIL_PASSWORD
        self.connection = None
        self.logger = logging.getLogger(__name__)
        
    def connect(self) -> bool:
        """Establish connection to IMAP server."""
        try:
            # Create SSL context
            context = ssl.create_default_context()
            
            # Connect to IMAP server
            self.connection = imaplib.IMAP4_SSL(
                self.imap_server, 
                self.imap_port, 
                ssl_context=context
            )
            
            # Login
            self.connection.login(self.email_address, self.password)
            self.logger.info(f"Successfully connected to {self.imap_server}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to connect to email server: {str(e)}")
            return False
    
    def disconnect(self):
        """Close IMAP connection."""
        if self.connection:
            try:
                self.connection.logout()
                self.logger.info("Disconnected from email server")
            except Exception as e:
                self.logger.error(f"Error disconnecting: {str(e)}")
            finally:
                self.connection = None
    
    def fetch_unread_emails(self, max_emails: int = None, skip_processed_ids: set = None) -> List[Dict]:
        """Fetch unread emails from inbox, skipping already processed ones."""
        if not self.connection:
            if not self.connect():
                return []
        
        try:
            # Select inbox
            self.connection.select('INBOX')
            
            # Search for unread emails
            _, message_numbers = self.connection.search(None, 'UNSEEN')
            
            if not message_numbers[0]:
                self.logger.info("No unread emails found")
                return []
            
            email_list = message_numbers[0].split()
            
            # Limit number of emails to process
            if max_emails:
                email_list = email_list[-max_emails:]
            
            emails = []
            skipped_count = 0
            
            for num in email_list:
                try:
                    # Fetch email
                    _, msg_data = self.connection.fetch(num, '(RFC822)')
                    email_body = msg_data[0][1]
                    email_message = email.message_from_bytes(email_body)
                    
                    # Extract email data
                    email_data = self._extract_email_data(email_message)
                    if email_data:
                        message_id = email_data.get('message_id', '')
                        
                        # Skip if already processed
                        if skip_processed_ids and message_id in skip_processed_ids:
                            skipped_count += 1
                            continue
                        
                        # Add message number for marking as read later
                        email_data['message_number'] = num.decode()
                        emails.append(email_data)
                        
                except Exception as e:
                    self.logger.error(f"Error processing email {num}: {str(e)}")
                    continue
            
            self.logger.info(f"Successfully fetched {len(emails)} new unread emails. Skipped {skipped_count} already processed.")
            return emails
            
        except Exception as e:
            self.logger.error(f"Error fetching emails: {str(e)}")
            return []
    
    def fetch_emails_by_date_range(self, start_date: datetime, end_date: datetime, 
                                 max_emails: int = None) -> List[Dict]:
        """Fetch emails within a date range, robust to IMAP quirks and time zones."""
        if not self.connection:
            if not self.connect():
                return []
        try:
            # Always select INBOX, fallback to first folder if needed
            try:
                self.connection.select('INBOX')
            except Exception as e:
                self.logger.warning(f"Could not select INBOX: {e}. Trying default folder.")
                self.connection.select()

            # IMAP search for broad range (may be inaccurate on some servers)
            start_str = (start_date - timedelta(days=1)).strftime('%d-%b-%Y')  # start a day early for safety
            end_str = (end_date + timedelta(days=2)).strftime('%d-%b-%Y')  # end a day late for safety
            search_criteria = f'(SINCE "{start_str}" BEFORE "{end_str}")'
            try:
                _, message_numbers = self.connection.search(None, search_criteria)
            except Exception as e:
                self.logger.error(f"IMAP search failed: {e}")
                return []
            if not message_numbers or not message_numbers[0]:
                self.logger.info(f"No emails found between {start_str} and {end_str}")
                return []
            email_list = message_numbers[0].split()
            # Limit number of emails to process
            if max_emails:
                email_list = email_list[-max_emails:]
            emails = []
            from email.utils import parsedate_to_datetime
            import pytz
            user_tz = None
            try:
                import tzlocal
                user_tz = tzlocal.get_localzone()
            except Exception:
                user_tz = None
            for num in email_list:
                try:
                    _, msg_data = self.connection.fetch(num, '(RFC822)')
                    email_body = msg_data[0][1]
                    email_message = email.message_from_bytes(email_body)
                    email_data = self._extract_email_data(email_message)
                    if not email_data:
                        continue
                    # Parse date header robustly
                    date_str = email_data.get('date', '')
                    try:
                        email_dt = parsedate_to_datetime(date_str)
                        if email_dt.tzinfo is None:
                            # Assume UTC if no timezone info
                            email_dt = email_dt.replace(tzinfo=pytz.UTC)
                        # Convert to local time for comparison
                        if user_tz:
                            email_dt = email_dt.astimezone(user_tz)
                        # Only include if within range
                        if start_date <= email_dt <= end_date:
                            emails.append(email_data)
                    except Exception as ex:
                        self.logger.warning(f"Could not parse date for email: {email_data.get('subject', '')} - {ex}")
                        continue
                except Exception as e:
                    self.logger.error(f"Error processing email {num}: {str(e)}")
                    continue
            self.logger.info(f"Fetched {len(emails)} emails after robust date filtering.")
            return emails
        except Exception as e:
            self.logger.error(f"Error fetching emails by date range: {str(e)}")
            return []
    
    def _extract_email_data(self, email_message) -> Optional[Dict]:
        """Extract relevant data from email message."""
        try:
            # Extract basic headers
            subject = email_message.get('Subject', '')
            sender = email_message.get('From', '')
            date = email_message.get('Date', '')
            message_id = email_message.get('Message-ID', '')
            
            # Extract email body
            body = self._get_email_body(email_message)
            
            if not body:
                return None
            
            return {
                'subject': subject,
                'sender': sender,
                'date': date,
                'message_id': message_id,
                'body': body,
                'raw_message': email_message
            }
            
        except Exception as e:
            self.logger.error(f"Error extracting email data: {str(e)}")
            return None
    
    def _get_email_body(self, email_message) -> str:
        """Extract plain text body from email message."""
        body = ""
        
        if email_message.is_multipart():
            for part in email_message.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition'))
                
                # Skip attachments
                if "attachment" in content_disposition:
                    continue
                
                # Get plain text content
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode()
                        break
                    except:
                        continue
                elif content_type == "text/html" and not body:
                    # Fallback to HTML if no plain text
                    try:
                        html_body = part.get_payload(decode=True).decode()
                        # Simple HTML to text conversion
                        body = self._html_to_text(html_body)
                    except:
                        continue
        else:
            # Not multipart
            content_type = email_message.get_content_type()
            if content_type == "text/plain":
                try:
                    body = email_message.get_payload(decode=True).decode()
                except:
                    pass
            elif content_type == "text/html":
                try:
                    html_body = email_message.get_payload(decode=True).decode()
                    body = self._html_to_text(html_body)
                except:
                    pass
        
        return body.strip()
    
    def _html_to_text(self, html_content: str) -> str:
        """Convert HTML content to plain text."""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text
        except ImportError:
            # Fallback if BeautifulSoup is not available
            import re
            # Remove HTML tags
            clean = re.compile('<.*?>')
            text = re.sub(clean, '', html_content)
            return text
        except Exception:
            return html_content
    
    def mark_as_read(self, message_numbers: List[str]) -> bool:
        """Mark emails as read using message numbers."""
        if not self.connection:
            return False
        
        try:
            for msg_num in message_numbers:
                self.connection.store(msg_num, '+FLAGS', '\\Seen')
            self.logger.info(f"Marked {len(message_numbers)} emails as read")
            return True
        except Exception as e:
            self.logger.error(f"Error marking emails as read: {str(e)}")
            return False
    
    def mark_emails_as_read(self, emails: List[Dict]) -> bool:
        """Mark a list of processed emails as read."""
        if not emails:
            return True
        
        message_numbers = []
        for email_data in emails:
            if 'message_number' in email_data:
                message_numbers.append(email_data['message_number'])
        
        return self.mark_as_read(message_numbers) 