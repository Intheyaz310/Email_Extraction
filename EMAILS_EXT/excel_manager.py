import pandas as pd
import logging
from typing import List, Dict, Optional
from datetime import datetime
import os

class ExcelManager:
    """Manages Excel file operations for job email data."""
    
    def __init__(self, filename: str = "job_emails.xlsx"):
        self.filename = filename
        self.logger = logging.getLogger(__name__)
        
        # Define column headers
        self.columns = [
            'Message_ID',  # Added for deduplication
            'Email_Date',
            'Sender',
            'Subject',
            'Job_Title',
            'Years_Experience',
            'Required_Skills',
            'Company_Name',
            'Job_Type',
            'Industry',
            'Seniority_Level',
            'Job_Summary',
            'Location',
            'Application_Deadline',
            'Min_Salary',
            'Max_Salary',
            'Extraction_Date',
            'Raw_Email'  # Added for email preview
        ]
    
    def create_excel_file(self) -> bool:
        """Create a new Excel file with headers if it doesn't exist."""
        try:
            if not os.path.exists(self.filename):
                # Create empty DataFrame with headers
                df = pd.DataFrame(columns=self.columns)
                df.to_excel(self.filename, index=False, engine='openpyxl')
                self.logger.info(f"Created new Excel file: {self.filename}")
                return True
            return True
        except Exception as e:
            self.logger.error(f"Error creating Excel file: {str(e)}")
            return False
    
    def load_existing_data(self) -> pd.DataFrame:
        """Load existing data from Excel file."""
        try:
            if os.path.exists(self.filename):
                df = pd.read_excel(self.filename, engine='openpyxl')
                self.logger.info(f"Loaded {len(df)} existing records from {self.filename}")
                return df
            else:
                return pd.DataFrame(columns=self.columns)
        except Exception as e:
            self.logger.error(f"Error loading Excel file: {str(e)}")
            return pd.DataFrame(columns=self.columns)
    
    def save_job_data(self, job_data: List[Dict]) -> bool:
        """Save job data to Excel file with Message-ID deduplication."""
        try:
            if not job_data:
                self.logger.info("No job data to save")
                return True
            
            # Create file if it doesn't exist
            if not self.create_excel_file():
                return False
            
            # Load existing data
            existing_df = self.load_existing_data()
            
            # Get existing Message-IDs to prevent duplicates
            existing_message_ids = set()
            if 'Message_ID' in existing_df.columns:
                existing_message_ids = set(existing_df['Message_ID'].dropna().tolist())
            
            # Prepare new data (only for emails not already processed)
            new_records = []
            skipped_count = 0
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            for job in job_data:
                message_id = job.get('message_id', '')
                
                # Skip if already processed
                if message_id in existing_message_ids:
                    skipped_count += 1
                    continue
                
                record = {
                    'Message_ID': message_id,
                    'Email_Date': job.get('email_date', ''),
                    'Sender': job.get('sender', ''),
                    'Subject': job.get('subject', ''),
                    'Job_Title': job.get('job_title', ''),
                    'Years_Experience': job.get('years_experience', ''),
                    'Required_Skills': self._format_skills(job.get('required_skills', [])),
                    'Company_Name': job.get('company_name', ''),
                    'Job_Type': job.get('job_type', ''),
                    'Industry': job.get('industry', ''),
                    'Seniority_Level': job.get('seniority_level', ''),
                    'Job_Summary': job.get('job_summary', ''),
                    'Location': job.get('location', ''),
                    'Application_Deadline': job.get('application_deadline', ''),
                    'Min_Salary': job.get('min_salary', ''),
                    'Max_Salary': job.get('max_salary', ''),
                    'Extraction_Date': current_time,
                    'Raw_Email': job.get('raw_email', '')[:1000]  # Limit raw email length
                }
                new_records.append(record)
            
            if not new_records:
                self.logger.info(f"No new job records to save. Skipped {skipped_count} already processed emails.")
                return True
            
            # Create DataFrame for new records
            new_df = pd.DataFrame(new_records)
            
            # Combine existing and new data
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            
            # Remove duplicates based on Message-ID (primary) and Subject/Sender (secondary)
            combined_df = combined_df.drop_duplicates(
                subset=['Message_ID'], 
                keep='last'
            )
            
            # Save to Excel
            combined_df.to_excel(self.filename, index=False, engine='openpyxl')
            
            self.logger.info(f"Successfully saved {len(new_records)} new job records to {self.filename}. Skipped {skipped_count} duplicates.")
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving job data: {str(e)}")
            return False
    
    def get_processed_message_ids(self) -> set:
        """Get set of already processed Message-IDs."""
        try:
            df = self.load_existing_data()
            if 'Message_ID' in df.columns:
                return set(df['Message_ID'].dropna().tolist())
            return set()
        except Exception as e:
            self.logger.error(f"Error getting processed Message-IDs: {str(e)}")
            return set()
    
    def is_email_processed(self, message_id: str) -> bool:
        """Check if an email with given Message-ID has been processed."""
        return message_id in self.get_processed_message_ids()
    
    def _format_skills(self, skills: List[str]) -> str:
        """Format skills list as comma-separated string."""
        if not skills:
            return ""
        return ", ".join(skills)
    
    def get_statistics(self) -> Dict:
        """Get statistics about the Excel file."""
        try:
            if not os.path.exists(self.filename):
                return {
                    'total_records': 0,
                    'file_size': 0,
                    'last_modified': None,
                    'companies': [],
                    'job_types': [],
                    'industries': []
                }
            
            df = self.load_existing_data()
            
            stats = {
                'total_records': len(df),
                'file_size': os.path.getsize(self.filename),
                'last_modified': datetime.fromtimestamp(os.path.getmtime(self.filename)),
                'companies': df['Company_Name'].dropna().unique().tolist(),
                'job_types': df['Job_Type'].dropna().unique().tolist(),
                'industries': df['Industry'].dropna().unique().tolist()
            }
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Error getting statistics: {str(e)}")
            return {}
    
    def search_jobs(self, criteria: Dict) -> pd.DataFrame:
        """Search jobs based on criteria."""
        try:
            df = self.load_existing_data()
            
            if df.empty:
                return df
            
            # Apply filters
            for column, value in criteria.items():
                if column in df.columns and value:
                    if isinstance(value, list):
                        # Multiple values (OR condition)
                        mask = df[column].str.contains('|'.join(value), case=False, na=False)
                    else:
                        # Single value
                        mask = df[column].str.contains(str(value), case=False, na=False)
                    df = df[mask]
            
            return df
            
        except Exception as e:
            self.logger.error(f"Error searching jobs: {str(e)}")
            return pd.DataFrame()
    
    def export_filtered_data(self, criteria: Dict, output_filename: str) -> bool:
        """Export filtered data to a new Excel file."""
        try:
            filtered_df = self.search_jobs(criteria)
            
            if filtered_df.empty:
                self.logger.info("No data matches the search criteria")
                return False
            
            filtered_df.to_excel(output_filename, index=False, engine='openpyxl')
            self.logger.info(f"Exported {len(filtered_df)} records to {output_filename}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error exporting filtered data: {str(e)}")
            return False
    
    def backup_file(self, backup_filename: str = None) -> bool:
        """Create a backup of the Excel file."""
        try:
            if not os.path.exists(self.filename):
                self.logger.warning("No file to backup")
                return False
            
            if not backup_filename:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                backup_filename = f"backup_{timestamp}_{self.filename}"
            
            import shutil
            shutil.copy2(self.filename, backup_filename)
            self.logger.info(f"Created backup: {backup_filename}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creating backup: {str(e)}")
            return False 