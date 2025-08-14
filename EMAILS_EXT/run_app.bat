@echo off
echo Starting Email Job Extractor...
echo.
echo This will open the web application in your browser.
echo If it doesn't open automatically, go to: http://localhost:8501
echo.
echo Press Ctrl+C to stop the application.
echo.
python -m streamlit run app.py
pause 