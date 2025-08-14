import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import time
import threading
import schedule
import os
import json
from typing import Dict, List, Optional

# Import our custom modules
from email_client import EmailClient
from text_processor import TextProcessor
from excel_manager import ExcelManager
from config import Config

# Page configuration
st.set_page_config(
    page_title="Email Job Extractor",
    page_icon="📧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .status-success {
        color: #28a745;
        font-weight: bold;
    }
    .status-error {
        color: #dc3545;
        font-weight: bold;
    }
    .status-warning {
        color: #ffc107;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

class EmailJobExtractorApp:
    def __init__(self):
        self.email_client = None
        self.text_processor = TextProcessor()
        self.excel_manager = ExcelManager()
        self.scheduler_thread = None
        self.is_running = False
        
        # Initialize session state
        if 'extraction_history' not in st.session_state:
            st.session_state.extraction_history = []
        if 'current_status' not in st.session_state:
            st.session_state.current_status = "Ready"
        if 'last_run' not in st.session_state:
            st.session_state.last_run = None
        
    def main(self):
        """Main application function"""
        st.markdown('<h1 class="main-header">📧 Email Job Extractor</h1>', unsafe_allow_html=True)
        
        # Sidebar for configuration
        self.sidebar_config()
        
        # --- UPGRADE: Main Metrics and Fetch Button ---
        self.main_metrics_and_fetch()
        
        # Main content area
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col2:
            # Status and controls
            self.status_section()
            
            # Main tabs
            tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "🔧 Manual Extraction", "📋 Results (Enhanced)", "⚙️ Settings"])
            
            with tab1:
                self.dashboard_tab()
            
            with tab2:
                self.manual_extraction_tab()
            
            with tab3:
                self.enhanced_results_tab()
            
            with tab4:
                self.settings_tab()
    
    def sidebar_config(self):
        """Sidebar configuration section"""
        st.sidebar.markdown("## 🔧 Configuration")

        # Debug logging toggle
        debug_mode = st.sidebar.checkbox("Enable Debug Logging", value=False)
        import logging
        if debug_mode:
            logging.basicConfig(level=logging.DEBUG)
            st.sidebar.info("Debug logging is ON. Recent log messages will appear below.")
        else:
            logging.basicConfig(level=logging.WARNING)

        # Show recent log messages if debug is enabled
        if debug_mode:
            import io
            log_stream = io.StringIO()
            handler = logging.StreamHandler(log_stream)
            logging.getLogger().addHandler(handler)

        # Track previous email address in session state
        prev_email = st.session_state.get('prev_email_address', None)

        # --- NEW: Email Provider Dropdown ---
        PROVIDER_PRESETS = {
            "Gmail": {"imap": "imap.gmail.com", "port": 993, "help": "Use an App Password if 2FA is enabled."},
            "Yahoo": {"imap": "imap.mail.yahoo.com", "port": 993, "help": "Use an App Password if 2FA is enabled."},
            "Outlook": {"imap": "outlook.office365.com", "port": 993, "help": "Use your Microsoft account password."},
            "Zoho": {"imap": "imap.zoho.com", "port": 993, "help": "Enable IMAP in Zoho settings."},
            "iCloud": {"imap": "imap.mail.me.com", "port": 993, "help": "Use an app-specific password from Apple ID."},
            "ProtonMail": {"imap": "127.0.0.1", "port": 1143, "help": "Requires ProtonMail Bridge app."},
            "Fastmail": {"imap": "imap.fastmail.com", "port": 993, "help": "Use your Fastmail password."},
            "Amazon WorkMail": {"imap": "imap.mail.us-east-1.awsapps.com", "port": 993, "help": "Use your WorkMail password."},
            "HostGator": {"imap": "mail.yourdomain.com", "port": 993, "help": "Replace with your domain's mail server."},
            "Custom": {"imap": "", "port": 993, "help": "Enter your IMAP server and port manually."},
        }
        provider_names = list(PROVIDER_PRESETS.keys())
        selected_provider = st.sidebar.selectbox("Email Provider", provider_names, index=provider_names.index("Gmail"))

        # Autofill IMAP server/port, but allow override
        default_imap = PROVIDER_PRESETS[selected_provider]["imap"]
        default_port = PROVIDER_PRESETS[selected_provider]["port"]
        provider_help = PROVIDER_PRESETS[selected_provider]["help"]

        st.sidebar.info(f"{selected_provider} IMAP: {default_imap}:{default_port}\n{provider_help}")

        # Email settings
        st.sidebar.markdown("### 📧 Email Settings")
        email_address = st.sidebar.text_input("Email Address", value=Config.EMAIL_ADDRESS, type="default")
        email_password = st.sidebar.text_input("App Password", value=Config.EMAIL_PASSWORD, type="password")
        imap_server = st.sidebar.text_input("IMAP Server", value=default_imap if not Config.IMAP_SERVER or Config.IMAP_SERVER=="imap.gmail.com" else Config.IMAP_SERVER)
        imap_port = st.sidebar.number_input("IMAP Port", value=default_port if not Config.IMAP_PORT or Config.IMAP_PORT==993 else Config.IMAP_PORT, min_value=1, max_value=65535)

        # --- NEW: Clear all data and use new Excel file if email changes ---
        if prev_email is not None and prev_email != email_address:
            # Clear all session state except prev_email_address
            for key in list(st.session_state.keys()):
                if key != 'prev_email_address':
                    del st.session_state[key]
            # Use a new Excel file for the new account
            safe_email = email_address.replace('@', '_at_').replace('.', '_')
            new_excel_filename = f"job_emails_{safe_email}.xlsx"
            # Clear the Excel file for the new account
            import pandas as pd
            empty_df = pd.DataFrame(columns=self.excel_manager.columns)
            empty_df.to_excel(new_excel_filename, index=False, engine='openpyxl')
            self.excel_manager = ExcelManager(new_excel_filename)
            st.sidebar.success(f"Switched account! All previous data cleared. Excel file reset: {new_excel_filename}")
        # Always update prev_email_address in session state
        st.session_state['prev_email_address'] = email_address
        # Use a new Excel file for each account
        safe_email = email_address.replace('@', '_at_').replace('.', '_')
        new_excel_filename = f"job_emails_{safe_email}.xlsx"
        self.excel_manager = ExcelManager(new_excel_filename)

        # Add a 'Delete Previous Data' button to the sidebar
        st.sidebar.markdown("---")
        if st.sidebar.button("🗑️ Delete Previous Data", key="delete_previous_data"):
            try:
                import os
                if os.path.exists(new_excel_filename):
                    os.remove(new_excel_filename)
                # Clear all session state except prev_email_address
                for key in list(st.session_state.keys()):
                    if key != 'prev_email_address':
                        del st.session_state[key]
                # Recreate empty Excel file
                import pandas as pd
                empty_df = pd.DataFrame(columns=self.excel_manager.columns)
                empty_df.to_excel(new_excel_filename, index=False, engine='openpyxl')
                self.excel_manager = ExcelManager(new_excel_filename)
                st.sidebar.success(f"All previous data deleted. Excel file reset: {new_excel_filename}")
            except Exception as e:
                st.sidebar.error(f"Failed to delete previous data: {e}")

        # Before each extraction, clear previous results from session state
        if 'last_extraction_results' in st.session_state:
            del st.session_state['last_extraction_results']

        # Save configuration
        if st.sidebar.button("💾 Save Configuration", key="save_config"):
            self.save_config(email_address, email_password, imap_server, imap_port)
            st.sidebar.success("Configuration saved!")

        st.sidebar.markdown("---")
        
        # Quick Extraction Options
        st.sidebar.markdown("### ⚡ Quick Extraction")
        
        # Extraction type
        quick_extraction_type = st.sidebar.selectbox(
            "Extraction Type",
            ["Unread Emails Only", "Date Range", "Last 24 Hours", "Last 7 Days", "Last 30 Days"],
            help="Choose what emails to extract"
        )
        
        # Date range options
        if quick_extraction_type == "Date Range":
            col_date1, col_date2 = st.sidebar.columns(2)
            with col_date1:
                start_date = st.date_input("Start Date", datetime.now() - timedelta(days=7))
            with col_date2:
                end_date = st.date_input("End Date", datetime.now())
            
            col_time1, col_time2 = st.sidebar.columns(2)
            with col_time1:
                start_time = st.time_input("Start Time", value=datetime.now().replace(hour=0, minute=0, second=0).time())
            with col_time2:
                end_time = st.time_input("End Time", value=datetime.now().time())
            
            start_datetime = datetime.combine(start_date, start_time)
            end_datetime = datetime.combine(end_date, end_time)
        else:
            start_datetime = end_datetime = None
        
        # Quick filters
        max_emails_quick = st.sidebar.number_input("Max Emails", 1, 100, 10)
        if max_emails_quick > 100:
            st.sidebar.warning("⚠️ For stability, please select 100 or fewer emails at a time.")
        sender_filter_quick = st.sidebar.text_input("Sender Filter", placeholder="@company.com")
        subject_filter_quick = st.sidebar.text_input("Subject Filter", placeholder="job, hiring")
        
        # Quick extraction button
        if st.sidebar.button("🚀 Quick Extract", type="primary", use_container_width=True, key="sidebar_quick_extract"):
            if max_emails_quick > 100:
                st.sidebar.error("❌ Please select 100 or fewer emails for extraction.")
            else:
                with st.spinner("Extracting emails..."):
                    try:
                        # Prepare extraction parameters
                        extraction_params = {
                            'extraction_type': quick_extraction_type,
                            'max_emails': max_emails_quick,
                            'email_status': "All",
                            'sender_filter': sender_filter_quick,
                            'subject_filter': subject_filter_quick,
                            'mark_as_read': True,
                            'save_to_excel': True,
                            'show_notification': True
                        }
                        # Add date range if specified
                        if start_datetime and end_datetime:
                            extraction_params.update({
                                'start_datetime': start_datetime,
                                'end_datetime': end_datetime
                            })
                        results = self.run_extraction(**extraction_params)
                        if results['success']:
                            st.sidebar.success(f"✅ Found {results['job_count']} jobs!")
                            # Store results in session state for display
                            st.session_state.last_extraction_results = results
                            st.rerun()
                        else:
                            st.sidebar.error(f"❌ Failed: {results['error']}")
                    except Exception as e:
                        st.sidebar.error(f"❌ Error: {str(e)}")
        
        st.sidebar.markdown("---")
        
        # Automation settings
        st.sidebar.markdown("### 🤖 Automation")
        auto_enabled = st.sidebar.checkbox("Enable Auto-Extraction", value=False)
        check_interval = st.sidebar.slider("Check Interval (minutes)", 1, 60, Config.CHECK_INTERVAL_MINUTES)
        max_emails = st.sidebar.number_input("Max Emails per Check", 1, 100, Config.MAX_EMAILS_PER_CHECK)
        
        if auto_enabled and not self.is_running:
            if st.sidebar.button("🚀 Start Auto-Extraction", key="start_auto_extraction"):
                self.start_automation(check_interval, max_emails)
        
        if self.is_running:
            if st.sidebar.button("⏹️ Stop Auto-Extraction", key="stop_auto_extraction"):
                self.stop_automation()
        
        st.sidebar.markdown("---")
        
        # --- UPGRADE: Quick Actions with Fetch Button ---
        st.sidebar.markdown("### 🔧 Quick Actions")
        if st.sidebar.button("📥 Test Connection", key="test_connection"):
            self.test_connection()
        
        if st.sidebar.button("📊 Refresh Data", key="refresh_data"):
            st.rerun()
        
        # Prominent Fetch New Emails button in sidebar
        st.sidebar.markdown("---")
        st.sidebar.markdown("### 🚀 Quick Fetch")
        if st.sidebar.button("📥 Fetch New Emails", type="primary", use_container_width=True, key="sidebar_fetch_button"):
            with st.spinner("Fetching and extracting new emails..."):
                result = self.run_extraction()
                if result['success']:
                    st.sidebar.success(f"✅ Found {result['job_count']} new jobs!")
                    st.session_state.last_extraction_results = result
                    st.rerun()
                else:
                    st.sidebar.error(f"❌ Error: {result.get('error', 'Unknown error')}")
        
        # Clear data option
        st.sidebar.markdown("### 🗑️ Data Management")
        if st.sidebar.button("🗑️ Clear All Data", type="secondary", key="clear_all_data"):
            if st.sidebar.checkbox("Confirm deletion"):
                try:
                    # Method 1: Try to delete the file completely
                    if os.path.exists(self.excel_manager.filename):
                        os.remove(self.excel_manager.filename)
                        st.sidebar.success("✅ Excel file deleted!")
                    
                    # Method 2: Create empty file with headers
                    empty_df = pd.DataFrame(columns=self.excel_manager.columns)
                    empty_df.to_excel(self.excel_manager.filename, index=False, engine='openpyxl')
                    
                    # Clear session state
                    if hasattr(st.session_state, 'last_extraction_results'):
                        del st.session_state.last_extraction_results
                    
                    # Force refresh
                    st.sidebar.success("✅ All data cleared! Refreshing...")
                    time.sleep(1)
                    st.rerun()
                except Exception as e:
                    st.sidebar.error(f"❌ Error: {str(e)}")
        
        # Force clear option (nuclear option)
        if st.sidebar.button("💥 Force Clear (Nuclear)", type="secondary", key="force_clear_nuclear"):
            if st.sidebar.checkbox("I understand this will delete everything"):
                try:
                    # Delete the file completely
                    if os.path.exists(self.excel_manager.filename):
                        os.remove(self.excel_manager.filename)
                    
                    # Clear all session state
                    for key in list(st.session_state.keys()):
                        del st.session_state[key]
                    
                    # Reinitialize session state
                    st.session_state.extraction_history = []
                    st.session_state.current_status = "Ready"
                    st.session_state.last_run = None
                    
                    st.sidebar.success("💥 Nuclear clear completed! Refreshing...")
                    time.sleep(2)
                    st.rerun()
                except Exception as e:
                    st.sidebar.error(f"❌ Nuclear clear failed: {str(e)}")
        
        # Show last extraction results in sidebar
        if hasattr(st.session_state, 'last_extraction_results') and st.session_state.last_extraction_results:
            st.sidebar.markdown("---")
            st.sidebar.markdown("### 📋 Last Extraction")
            results = st.session_state.last_extraction_results
            st.sidebar.write(f"**Jobs Found:** {results['job_count']}")
            st.sidebar.write(f"**Time:** {st.session_state.last_run.strftime('%H:%M:%S') if st.session_state.last_run else 'N/A'}")
            
            if st.sidebar.button("📥 Download Results", key="download_results"):
                if results['job_data']:
                    results_df = pd.DataFrame(results['job_data'])
                    csv_data = results_df.to_csv(index=False)
                    st.sidebar.download_button(
                        label="📄 Download CSV",
                        data=csv_data,
                        file_name=f"quick_extraction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                        mime="text/csv"
                    )
        
        # Show recent log messages if debug is enabled
        if debug_mode:
            handler.flush()
            log_contents = log_stream.getvalue()
            if log_contents:
                st.sidebar.text_area("Recent Log Output", log_contents, height=150)
            logging.getLogger().removeHandler(handler)
    
    def main_metrics_and_fetch(self):
        """Display main metrics and fetch button"""
        # Get statistics
        stats = self.excel_manager.get_statistics()
        
        # Metrics row
        col1, col2, col3, col4, col5 = st.columns(5)
        with col1:
            st.metric("📊 Total Jobs", stats.get('total_records', 0))
        with col2:
            st.metric("🏢 Companies", len(stats.get('companies', [])))
        with col3:
            st.metric("💼 Job Types", len(stats.get('job_types', [])))
        with col4:
            st.metric("🌍 Industries", len(stats.get('industries', [])))
        with col5:
            st.metric("📍 Locations", len(stats.get('locations', [])))
        
        # Fetch button row
        st.markdown("---")
        col_fetch1, col_fetch2, col_fetch3 = st.columns([1, 2, 1])
        with col_fetch2:
            if st.button("📥 Fetch New Emails", type="primary", use_container_width=True, key="main_fetch_button"):
                with st.spinner("Fetching and extracting new emails..."):
                    result = self.run_extraction()
                    if result['success']:
                        st.success(f"✅ Found {result['job_count']} new jobs!")
                        st.session_state.last_extraction_results = result
                        st.rerun()
                    else:
                        st.error(f"❌ Error: {result.get('error', 'Unknown error')}")
        
        st.markdown("---")
    
    def status_section(self):
        """Status and control section"""
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Status", st.session_state.current_status)
        
        with col2:
            if st.session_state.last_run:
                st.metric("Last Run", st.session_state.last_run.strftime("%H:%M:%S"))
            else:
                st.metric("Last Run", "Never")
        
        with col3:
            stats = self.excel_manager.get_statistics()
            st.metric("Total Records", stats.get('total_records', 0))
        
        with col4:
            if self.is_running:
                st.metric("Auto-Extraction", "🟢 Running")
            else:
                st.metric("Auto-Extraction", "🔴 Stopped")
    
    def dashboard_tab(self):
        """Dashboard tab with analytics"""
        st.markdown("## 📊 Dashboard")
        
        # Get statistics
        stats = self.excel_manager.get_statistics()
        
        # Key metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Total Jobs", stats.get('total_records', 0))
            st.markdown('</div>', unsafe_allow_html=True)
        
        with col2:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Companies", len(stats.get('companies', [])))
            st.markdown('</div>', unsafe_allow_html=True)
        
        with col3:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Job Types", len(stats.get('job_types', [])))
            st.markdown('</div>', unsafe_allow_html=True)
        
        with col4:
            st.markdown('<div class="metric-card">', unsafe_allow_html=True)
            st.metric("Industries", len(stats.get('industries', [])))
            st.markdown('</div>', unsafe_allow_html=True)
        
        # Load data for charts
        df = self.excel_manager.load_existing_data()
        
        if not df.empty:
            # Charts
            col1, col2 = st.columns(2)
            
            with col1:
                # Job types distribution
                if 'Job_Type' in df.columns and not df['Job_Type'].isna().all():
                    job_type_counts = df['Job_Type'].value_counts()
                    fig = px.pie(values=job_type_counts.values, names=job_type_counts.index, 
                               title="Job Types Distribution")
                    st.plotly_chart(fig, use_container_width=True)
            
            with col2:
                # Companies distribution
                if 'Company_Name' in df.columns and not df['Company_Name'].isna().all():
                    company_counts = df['Company_Name'].value_counts().head(10)
                    fig = px.bar(x=company_counts.values, y=company_counts.index, 
                               orientation='h', title="Top 10 Companies")
                    st.plotly_chart(fig, use_container_width=True)
            
            # Recent activity
            st.markdown("### 📈 Recent Activity")
            if 'Extraction_Date' in df.columns:
                df['Extraction_Date'] = pd.to_datetime(df['Extraction_Date'])
                recent_activity = df.groupby(df['Extraction_Date'].dt.date).size()
                fig = px.line(x=recent_activity.index, y=recent_activity.values, 
                            title="Jobs Extracted Over Time")
                st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No data available. Run an extraction to see analytics.")
    
    def manual_extraction_tab(self):
        """Manual extraction tab"""
        st.markdown("## 🔧 Manual Extraction")
        
        # Extraction options
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 📥 Extraction Options")
            extraction_type = st.selectbox(
                "Extraction Type",
                ["Unread Emails Only", "Date Range", "All Emails", "Custom Filter"]
            )
            
            max_emails = st.number_input("Maximum Emails", 1, 100, 10)
            
            # Date and time selection
            st.markdown("### 📅 Date & Time Selection")
            
            if extraction_type == "Date Range":
                col_date1, col_date2 = st.columns(2)
                with col_date1:
                    start_date = st.date_input("Start Date", datetime.now() - timedelta(days=7))
                with col_date2:
                    end_date = st.date_input("End Date", datetime.now())
                
                # Time selection
                col_time1, col_time2 = st.columns(2)
                with col_time1:
                    start_time = st.time_input("Start Time", value=datetime.now().replace(hour=0, minute=0, second=0).time())
                with col_time2:
                    end_time = st.time_input("End Time", value=datetime.now().time())
                
                # Combine date and time
                start_datetime = datetime.combine(start_date, start_time)
                end_datetime = datetime.combine(end_date, end_time)
                
            elif extraction_type == "Custom Filter":
                # Custom date range with more options
                st.markdown("#### Custom Date Range")
                date_option = st.selectbox(
                    "Date Range Option",
                    ["Last 24 hours", "Last 7 days", "Last 30 days", "Last 3 months", "Custom range"]
                )
                
                if date_option == "Custom range":
                    col_date1, col_date2 = st.columns(2)
                    with col_date1:
                        start_date = st.date_input("Start Date", datetime.now() - timedelta(days=7))
                    with col_date2:
                        end_date = st.date_input("End Date", datetime.now())
                    
                    col_time1, col_time2 = st.columns(2)
                    with col_time1:
                        start_time = st.time_input("Start Time", value=datetime.now().replace(hour=0, minute=0, second=0).time())
                    with col_time2:
                        end_time = st.time_input("End Time", value=datetime.now().time())
                    
                    start_datetime = datetime.combine(start_date, start_time)
                    end_datetime = datetime.combine(end_date, end_time)
                else:
                    # Predefined ranges
                    now = datetime.now()
                    if date_option == "Last 24 hours":
                        start_datetime = now - timedelta(days=1)
                        end_datetime = now
                    elif date_option == "Last 7 days":
                        start_datetime = now - timedelta(days=7)
                        end_datetime = now
                    elif date_option == "Last 30 days":
                        start_datetime = now - timedelta(days=30)
                        end_datetime = now
                    elif date_option == "Last 3 months":
                        start_datetime = now - timedelta(days=90)
                        end_datetime = now
            else:
                start_datetime = end_datetime = None
        
        with col2:
            st.markdown("### 🔍 Filter Options")
            
            # Email status filter
            email_status = st.selectbox(
                "Email Status",
                ["All", "Unread Only", "Read Only"],
                help="Filter emails by their read status"
            )
            
            sender_filter = st.text_input("Sender Email Filter (optional)", 
                                        placeholder="e.g., @company.com")
            subject_filter = st.text_input("Subject Filter (optional)", 
                                         placeholder="e.g., job, position, hiring")
            
            # Advanced filters
            st.markdown("#### Advanced Filters")
            with st.expander("Advanced Filter Options"):
                # Priority filter
                priority_filter = st.selectbox(
                    "Priority",
                    ["All", "High", "Normal", "Low"]
                )
                
                # Size filter
                min_size = st.number_input("Minimum Size (KB)", 0, 10000, 0)
                max_size = st.number_input("Maximum Size (KB)", 0, 10000, 10000)
                
                # Has attachment filter
                has_attachment = st.selectbox(
                    "Has Attachments",
                    ["All", "With Attachments", "Without Attachments"]
                )
            
            st.markdown("### 📋 Processing Options")
            mark_as_read = st.checkbox("Mark emails as read after processing", value=True)
            save_to_excel = st.checkbox("Save results to Excel", value=True)
            
            # Notification options
            st.markdown("#### Notification Options")
            show_notification = st.checkbox("Show notification after extraction", value=True)
            email_summary = st.checkbox("Send email summary", value=False)
        
        # Display selected options
        st.markdown("### 📋 Selected Options Summary")
        summary_col1, summary_col2 = st.columns(2)
        
        with summary_col1:
            st.write(f"**Extraction Type:** {extraction_type}")
            st.write(f"**Max Emails:** {max_emails}")
            st.write(f"**Email Status:** {email_status}")
            
        with summary_col2:
            if start_datetime and end_datetime:
                st.write(f"**Date Range:** {start_datetime.strftime('%Y-%m-%d %H:%M')} to {end_datetime.strftime('%Y-%m-%d %H:%M')}")
            else:
                st.write("**Date Range:** Not specified")
            st.write(f"**Save to Excel:** {save_to_excel}")
            st.write(f"**Mark as Read:** {mark_as_read}")
        
        # Run extraction
        col_run1, col_run2, col_run3 = st.columns([1, 1, 1])
        
        with col_run2:
            if st.button("🚀 Start Extraction", type="primary", use_container_width=True, key="manual_start_extraction"):
                with st.spinner("Extracting job information..."):
                    try:
                        # Prepare extraction parameters
                        extraction_params = {
                            'extraction_type': extraction_type,
                            'max_emails': max_emails,
                            'email_status': email_status,
                            'sender_filter': sender_filter,
                            'subject_filter': subject_filter,
                            'mark_as_read': mark_as_read,
                            'save_to_excel': save_to_excel,
                            'show_notification': show_notification
                        }
                        
                        # Add date range if specified
                        if start_datetime and end_datetime:
                            extraction_params.update({
                                'start_datetime': start_datetime,
                                'end_datetime': end_datetime
                            })
                        
                        results = self.run_extraction(**extraction_params)
                        
                        if results['success']:
                            st.success(f"✅ Extraction completed! Found {results['job_count']} job-related emails.")
                            
                            # Show detailed results
                            if results['job_data']:
                                st.markdown("### 📊 Extraction Results")
                                
                                # Create a nice results display
                                for i, job in enumerate(results['job_data'], 1):
                                    with st.expander(f"Job {i}: {job.get('job_title', 'No Title')} at {job.get('company_name', 'Unknown Company')}"):
                                        col_job1, col_job2 = st.columns(2)
                                        
                                        with col_job1:
                                            st.write(f"**Company:** {job.get('company_name', 'N/A')}")
                                            st.write(f"**Location:** {job.get('location', 'N/A')}")
                                            st.write(f"**Job Type:** {job.get('job_type', 'N/A')}")
                                            st.write(f"**Experience:** {job.get('years_experience', 'N/A')} years")
                                        
                                        with col_job2:
                                            st.write(f"**Industry:** {job.get('industry', 'N/A')}")
                                            st.write(f"**Seniority:** {job.get('seniority_level', 'N/A')}")
                                            st.write(f"**Salary:** {job.get('min_salary', 'N/A')} - {job.get('max_salary', 'N/A')}")
                                            st.write(f"**Deadline:** {job.get('application_deadline', 'N/A')}")
                                        
                                        if job.get('required_skills'):
                                            st.write(f"**Skills:** {', '.join(job['required_skills'])}")
                                        
                                        if job.get('job_summary'):
                                            st.write(f"**Summary:** {job['job_summary'][:200]}...")
                                        
                                        st.write(f"**Email:** {job.get('sender', 'N/A')}")
                                        st.write(f"**Subject:** {job.get('subject', 'N/A')}")
                        else:
                            st.error(f"❌ Extraction failed: {results['error']}")
                    
                    except Exception as e:
                        st.error(f"❌ Error during extraction: {str(e)}")
                        st.exception(e)
    
    def enhanced_results_tab(self):
        """Enhanced results tab with advanced filtering and actions"""
        st.markdown("## 📋 Results Management (Enhanced)")
        
        # Load data
        df = self.excel_manager.load_existing_data()
        
        if not df.empty:
            # --- Advanced Filters ---
            st.markdown("### 🔍 Advanced Filters")
            filter_cols = st.columns(4)
            
            with filter_cols[0]:
                job_titles = st.multiselect(
                    "Job Title", 
                    sorted(df['Job_Title'].dropna().unique()) if 'Job_Title' in df.columns else []
                )
            
            with filter_cols[1]:
                companies = st.multiselect(
                    "Company", 
                    sorted(df['Company_Name'].dropna().unique()) if 'Company_Name' in df.columns else []
                )
            
            with filter_cols[2]:
                locations = st.multiselect(
                    "Location", 
                    sorted(df['Location'].dropna().unique()) if 'Location' in df.columns else []
                )
            
            with filter_cols[3]:
                skills = st.text_input("Skills (comma-separated)")
            
            # Apply filters
            filtered_df = df.copy()
            if job_titles:
                filtered_df = filtered_df[filtered_df['Job_Title'].isin(job_titles)]
            if companies:
                filtered_df = filtered_df[filtered_df['Company_Name'].isin(companies)]
            if locations:
                filtered_df = filtered_df[filtered_df['Location'].isin(locations)]
            if skills:
                skill_list = [s.strip().lower() for s in skills.split(',') if s.strip()]
                if skill_list and 'Required_Skills' in filtered_df.columns:
                    filtered_df = filtered_df[filtered_df['Required_Skills'].str.lower().apply(
                        lambda x: any(skill in x for skill in skill_list) if isinstance(x, str) else False
                    )]
            
            st.markdown(f"### 📊 Results ({len(filtered_df)} records)")
            
            # --- Export Buttons ---
            export_cols = st.columns(3)
            with export_cols[0]:
                csv = filtered_df.to_csv(index=False)
                st.download_button(
                    "📥 Export to CSV", 
                    csv, 
                    file_name=f"jobs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv", 
                    mime="text/csv"
                )
            
            with export_cols[1]:
                try:
                    # Create Excel export
                    excel_filename = f"jobs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                    filtered_df.to_excel(excel_filename, index=False, engine='openpyxl')
                    with open(excel_filename, 'rb') as f:
                        excel_data = f.read()
                    st.download_button(
                        "📊 Export to Excel",
                        excel_data,
                        file_name=excel_filename,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
                except Exception as e:
                    st.info(f"Excel export: {str(e)}")
            
            with export_cols[2]:
                st.info("📄 PDF export coming in Phase 2!")
            
            st.markdown("---")
            
            # --- Enhanced Data Table with Actions ---
            st.markdown("### 🎯 Job Details (Click to expand)")
            
            for idx, row in filtered_df.iterrows():
                job_title = row.get('Job_Title', 'No Title')
                company = row.get('Company_Name', 'No Company')
                location = row.get('Location', 'No Location')
                
                with st.expander(f"🎯 {job_title} at {company} [{location}]", expanded=False):
                    # Display job details
                    detail_cols = st.columns(2)
                    with detail_cols[0]:
                        st.write(f"**Job Title:** {job_title}")
                        st.write(f"**Company:** {company}")
                        st.write(f"**Location:** {location}")
                        st.write(f"**Job Type:** {row.get('Job_Type', 'N/A')}")
                        st.write(f"**Experience:** {row.get('Years_Experience', 'N/A')}")
                    
                    with detail_cols[1]:
                        st.write(f"**Industry:** {row.get('Industry', 'N/A')}")
                        st.write(f"**Seniority:** {row.get('Seniority_Level', 'N/A')}")
                        st.write(f"**Salary:** {row.get('Min_Salary', 'N/A')} - {row.get('Max_Salary', 'N/A')}")
                        st.write(f"**Deadline:** {row.get('Application_Deadline', 'N/A')}")
                        st.write(f"**Skills:** {row.get('Required_Skills', 'N/A')}")
                    
                    # Action buttons
                    action_cols = st.columns(3)
                    with action_cols[0]:
                        if st.button(f"🔄 Re-extract", key=f"reextract_{idx}"):
                            st.info("🔄 Re-extraction feature coming soon!")
                    
                    with action_cols[1]:
                        if st.button(f"📝 Preview Email", key=f"preview_{idx}"):
                            raw_email = row.get('Raw_Email', 'Raw email not available.')
                            st.code(raw_email[:500] + "..." if len(raw_email) > 500 else raw_email, language='text')
                    
                    with action_cols[2]:
                        if st.button(f"📋 View Full", key=f"full_{idx}"):
                            st.json(row.to_dict())
            
            # --- DataFrame Table ---
            st.markdown("### 📋 Data Table")
            st.dataframe(filtered_df, use_container_width=True)
            
        else:
            st.info("📭 No data available. Run an extraction to see results.")
    
    def settings_tab(self):
        """Settings tab"""
        st.markdown("## ⚙️ Settings")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 🔧 Application Settings")
            
            # Excel file settings
            excel_filename = st.text_input("Excel Filename", value=Config.EXCEL_FILENAME)
            
            # NLP settings
            st.markdown("### 🤖 NLP Settings")
            use_spacy = st.checkbox("Use spaCy", value=Config.USE_SPACY)
            use_bert = st.checkbox("Use BERT", value=Config.USE_BERT)
            confidence_threshold = st.slider("Confidence Threshold", 0.0, 1.0, Config.CONFIDENCE_THRESHOLD, 0.1)
        
        with col2:
            st.markdown("### 📊 Display Settings")
            
            # Dashboard settings
            auto_refresh = st.checkbox("Auto-refresh dashboard", value=True)
            refresh_interval = st.slider("Refresh interval (seconds)", 5, 60, 30)
            
            # Notification settings
            st.markdown("### 🔔 Notification Settings")
            email_notifications = st.checkbox("Email notifications", value=False)
            desktop_notifications = st.checkbox("Desktop notifications", value=True)
        
        # Save settings
        if st.button("💾 Save Settings", key="save_settings"):
            # Save settings logic here
            st.success("Settings saved!")
    
    def generate_detailed_report(self, job_data):
        """Generate a detailed report of extracted jobs"""
        try:
            # Create a comprehensive report
            report_content = f"""
# Job Extraction Report
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Total Jobs Found: {len(job_data)}

## Summary
- Total Jobs: {len(job_data)}
- Unique Companies: {len(set(job.get('company_name', '') for job in job_data if job.get('company_name')))}
- Job Types: {len(set(job.get('job_type', '') for job in job_data if job.get('job_type')))}
- Locations: {len(set(job.get('location', '') for job in job_data if job.get('location')))}

## Detailed Job Listings
"""
            
            for i, job in enumerate(job_data, 1):
                report_content += f"""
### Job {i}: {job.get('job_title', 'No Title')}
- **Company:** {job.get('company_name', 'N/A')}
- **Location:** {job.get('location', 'N/A')}
- **Job Type:** {job.get('job_type', 'N/A')}
- **Experience:** {job.get('years_experience', 'N/A')} years
- **Industry:** {job.get('industry', 'N/A')}
- **Seniority:** {job.get('seniority_level', 'N/A')}
- **Salary:** {job.get('min_salary', 'N/A')} - {job.get('max_salary', 'N/A')}
- **Deadline:** {job.get('application_deadline', 'N/A')}
- **Skills:** {', '.join(job.get('required_skills', []))}
- **Contact:** {job.get('sender', 'N/A')}
- **Subject:** {job.get('subject', 'N/A')}
- **Summary:** {job.get('job_summary', 'N/A')}

---
"""
            
            # Save report to file
            report_filename = f"job_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            with open(report_filename, 'w', encoding='utf-8') as f:
                f.write(report_content)
            
            st.success(f"📋 Detailed report saved as: {report_filename}")
            
            # Offer download
            st.download_button(
                label="📥 Download Report",
                data=report_content,
                file_name=report_filename,
                mime="text/plain"
            )
            
        except Exception as e:
            st.error(f"Error generating report: {str(e)}")
    
    def run_extraction(self, extraction_type="Unread Emails Only", max_emails=10, 
                      email_status="All", start_datetime=None, end_datetime=None, 
                      sender_filter="", subject_filter="", mark_as_read=True, 
                      save_to_excel=True, show_notification=True):
        """Run email extraction with given parameters and deduplication"""
        try:
            # Initialize email client with latest values
            self.email_client = EmailClient(
                imap_server=getattr(self, 'imap_server', Config.IMAP_SERVER),
                imap_port=getattr(self, 'imap_port', Config.IMAP_PORT),
                email_address=getattr(self, 'email_address', Config.EMAIL_ADDRESS),
                password=getattr(self, 'email_password', Config.EMAIL_PASSWORD)
            )
            if not self.email_client.connect():
                return {'success': False, 'error': 'Failed to connect to email server'}
            
            # Get already processed Message-IDs to skip duplicates
            processed_message_ids = self.excel_manager.get_processed_message_ids()
            
            # Fetch emails based on type and status
            if extraction_type == "Unread Emails Only":
                emails = self.email_client.fetch_unread_emails(
                    max_emails=max_emails, 
                    skip_processed_ids=processed_message_ids
                )
            elif extraction_type == "Date Range" and start_datetime and end_datetime:
                emails = self.email_client.fetch_emails_by_date_range(
                    start_datetime, end_datetime, max_emails=max_emails
                )
                # Filter out already processed emails
                emails = [e for e in emails if e.get('message_id', '') not in processed_message_ids]
            elif extraction_type == "Custom Filter" and start_datetime and end_datetime:
                emails = self.email_client.fetch_emails_by_date_range(
                    start_datetime, end_datetime, max_emails=max_emails
                )
                # Filter out already processed emails
                emails = [e for e in emails if e.get('message_id', '') not in processed_message_ids]
            else:  # All Emails or fallback
                emails = self.email_client.fetch_unread_emails(
                    max_emails=max_emails, 
                    skip_processed_ids=processed_message_ids
                )
            
            if not emails:
                return {
                    'success': True, 
                    'job_count': 0, 
                    'job_data': [],
                    'email_count': 0,
                    'total_emails_processed': 0,
                    'skipped_duplicates': len(processed_message_ids)
                }
            
            # Apply email status filter
            if email_status == "Unread Only":
                # Emails are already unread from fetch_unread_emails
                pass
            elif email_status == "Read Only":
                # This would require fetching all emails and filtering by read status
                # For now, we'll skip this as it requires more complex IMAP operations
                st.warning("Read-only filtering not implemented yet. Fetching unread emails.")
            
            # Apply sender filter
            if sender_filter:
                emails = [e for e in emails if sender_filter.lower() in e.get('sender', '').lower()]
            
            # Apply subject filter
            if subject_filter:
                keywords = [k.strip().lower() for k in subject_filter.split(',')]
                filtered_emails = []
                for e in emails:
                    subject = e.get('subject', '').lower()
                    if any(keyword in subject for keyword in keywords):
                        filtered_emails.append(e)
                emails = filtered_emails
            
            # Process emails and extract job information
            job_data = []
            processed_emails = []
            skipped_count = 0
            progress_bar = st.progress(0, text="Processing emails...")
            total_emails = len(emails)
            for idx, email_data in enumerate(emails):
                try:
                    # Double-check Message-ID to prevent duplicates
                    message_id = email_data.get('message_id', '')
                    if message_id in processed_message_ids:
                        skipped_count += 1
                        continue
                    # Extract job information
                    job_info = self.text_processor.extract_all_job_info(email_data['body'])
                    # Add email metadata
                    job_info.update({
                        'email_date': email_data.get('date', ''),
                        'sender': email_data.get('sender', ''),
                        'subject': email_data.get('subject', ''),
                        'message_id': message_id,
                        'raw_email': email_data.get('body', '')
                    })
                    # Only add if it looks like a job email
                    if self._is_job_email(job_info, email_data):
                        job_data.append(job_info)
                        processed_emails.append(email_data)
                except Exception as e:
                    st.error(f"Error processing email: {str(e)}")
                    continue
                # Update progress bar
                progress_bar.progress((idx + 1) / total_emails, text=f"Processing email {idx + 1} of {total_emails}")
            progress_bar.empty()
            
            # Mark emails as read if requested
            if mark_as_read and processed_emails:
                self.email_client.mark_emails_as_read(processed_emails)
            
            # Save to Excel if requested
            if save_to_excel and job_data:
                if not self.excel_manager.save_job_data(job_data):
                    return {'success': False, 'error': 'Failed to save job data to Excel'}
            
            # Update session state
            st.session_state.current_status = "Completed"
            st.session_state.last_run = datetime.now()
            
            # Show notification if requested
            if show_notification:
                if job_data:
                    st.success(f"✅ Successfully extracted {len(job_data)} job(s) from {len(processed_emails)} email(s). Skipped {skipped_count} duplicates.")
                else:
                    st.info(f"ℹ️ No new job emails found. Skipped {skipped_count} already processed emails.")
            
            return {
                'success': True,
                'job_count': len(job_data),
                'job_data': job_data,
                'email_count': len(processed_emails),
                'total_emails_processed': len(emails),
                'skipped_duplicates': skipped_count
            }
            
        except Exception as e:
            st.session_state.current_status = "Error"
            return {'success': False, 'error': str(e)}
        finally:
            if self.email_client:
                self.email_client.disconnect()
    
    def _is_job_email(self, job_info: Dict, email_data: Dict) -> bool:
        """Check if an email contains job-related information."""
        # Check if we have job title or company name
        if job_info.get('job_title') or job_info.get('company_name'):
            return True
        
        # Check subject for job-related keywords
        subject = email_data.get('subject', '').lower()
        job_keywords = ['job', 'position', 'opportunity', 'career', 'hiring', 'recruiting', 'vacancy']
        if any(keyword in subject for keyword in job_keywords):
            return True
        
        # Check body for job-related keywords
        body = email_data.get('body', '').lower()
        if any(keyword in body for keyword in job_keywords):
            return True
        
        return False
    
    def test_connection(self):
        """Test email connection"""
        try:
            email_client = EmailClient(
                imap_server=getattr(self, 'imap_server', Config.IMAP_SERVER),
                imap_port=getattr(self, 'imap_port', Config.IMAP_PORT),
                email_address=getattr(self, 'email_address', Config.EMAIL_ADDRESS),
                password=getattr(self, 'email_password', Config.EMAIL_PASSWORD)
            )
            if email_client.connect():
                st.success("✅ Email connection successful!")
            else:
                st.error("❌ Email connection failed!")
        except Exception as e:
            st.error(f"❌ Connection error: {str(e)}")
    
    def save_config(self, email_address, email_password, imap_server, imap_port):
        """Save configuration to .env file"""
        try:
            with open('.env', 'w') as f:
                f.write(f"EMAIL_ADDRESS={email_address}\n")
                f.write(f"EMAIL_PASSWORD={email_password}\n")
                f.write(f"IMAP_SERVER={imap_server}\n")
                f.write(f"IMAP_PORT={imap_port}\n")
                f.write(f"CHECK_INTERVAL_MINUTES={Config.CHECK_INTERVAL_MINUTES}\n")
                f.write(f"EXCEL_FILENAME={Config.EXCEL_FILENAME}\n")
                f.write(f"MAX_EMAILS_PER_CHECK={Config.MAX_EMAILS_PER_CHECK}\n")
                f.write(f"USE_SPACY={str(Config.USE_SPACY).lower()}\n")
                f.write(f"USE_BERT={str(Config.USE_BERT).lower()}\n")
                f.write(f"CONFIDENCE_THRESHOLD={Config.CONFIDENCE_THRESHOLD}\n")
        except Exception as e:
            st.error(f"Error saving configuration: {str(e)}")
    
    def start_automation(self, check_interval, max_emails):
        """Start automated extraction"""
        self.is_running = True
        st.session_state.current_status = "Automation Running"
        
        def automation_loop():
            while self.is_running:
                try:
                    results = self.run_extraction(
                        extraction_type="Unread Emails",
                        max_emails=max_emails,
                        mark_as_read=True,
                        save_to_excel=True
                    )
                    
                    if results['success'] and results['job_count'] > 0:
                        st.session_state.extraction_history.append({
                            'timestamp': datetime.now(),
                            'jobs_found': results['job_count']
                        })
                    
                    time.sleep(check_interval * 60)  # Convert to seconds
                    
                except Exception as e:
                    st.error(f"Automation error: {str(e)}")
                    time.sleep(check_interval * 60)
        
        self.scheduler_thread = threading.Thread(target=automation_loop, daemon=True)
        self.scheduler_thread.start()
    
    def stop_automation(self):
        """Stop automated extraction"""
        self.is_running = False
        st.session_state.current_status = "Ready"

def main():
    """Main function to run the Streamlit app"""
    app = EmailJobExtractorApp()
    app.main()

if __name__ == "__main__":
    main() 