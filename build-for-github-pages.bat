@echo off
echo Building React app for GitHub Pages...

REM Build the React app
npm run build

REM Clear docs directory
if exist docs rmdir /s /q docs
mkdir docs

REM Copy built files to docs
xcopy dist\* docs\ /E /I /Y

REM Copy .nojekyll file
copy .nojekyll docs\

echo Build complete! Files are ready in the docs directory.
echo Push to GitHub to trigger deployment.
pause
