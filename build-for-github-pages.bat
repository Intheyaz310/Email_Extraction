@echo off
echo Building React app for GitHub Pages...

REM Build the React app
npm run build

echo Build complete! 
echo Push to GitHub to trigger automatic deployment to GitHub Pages.
echo The GitHub Actions workflow will handle the deployment.
pause
