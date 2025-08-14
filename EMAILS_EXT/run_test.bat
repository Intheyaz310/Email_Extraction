@echo off
echo Installing required packages...
"C:\Users\KARTHIK BURGULA\AppData\Local\Programs\Python\Python313\python.exe" -m pip install python-dotenv pandas openpyxl nltk beautifulsoup4

echo.
echo Running simple connection test...
"C:\Users\KARTHIK BURGULA\AppData\Local\Programs\Python\Python313\python.exe" simple_test.py

echo.
echo Press any key to exit...
pause 