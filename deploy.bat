@echo off
setlocal enabledelayedexpansion

echo 🚀 Email Extraction Application - Deployment Script
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is installed
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Docker Compose is installed
    ) else (
        echo ⚠️  Docker Compose is not installed. Please install it.
    )
) else (
    echo ⚠️  Docker is not installed. Some deployment options will not be available.
)

:menu
echo.
echo 📋 Available Deployment Options:
echo 1. Vercel (Recommended - Frontend + Backend)
echo 2. Docker (Local/Cloud - Full Stack)
echo 3. Build Only (Prepare for manual deployment)
echo 4. Setup Database Only
echo 5. Exit
echo.

set /p choice="Choose an option (1-5): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto docker
if "%choice%"=="3" goto build
if "%choice%"=="4" goto database
if "%choice%"=="5" goto exit
echo ❌ Invalid option. Please choose 1-5.
goto menu

:vercel
echo 🚀 Deploying to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📥 Installing Vercel CLI...
    npm install -g vercel
)

echo 📦 Building frontend...
call npm install
call npm run build

echo 🔧 Deploying frontend...
vercel --prod

echo 🔧 Deploying backend...
cd backend
vercel --prod
cd ..

echo ✅ Vercel deployment completed!
goto end

:docker
echo 🐳 Deploying with Docker...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is required for this deployment option
    pause
    exit /b 1
)

echo 📦 Building frontend...
call npm install
call npm run build

echo 🔨 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

echo ✅ Docker deployment completed!
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo    AI Service: http://localhost:8001
goto end

:build
echo 📦 Building application...

call npm install
call npm run build

echo ✅ Build completed! Check the 'dist' folder for the frontend build.
echo 📁 Backend is ready in the 'backend' folder.
echo 🐍 Python AI service is ready in the 'EMAILS_EXT' folder.
goto end

:database
echo 🗄️  Setting up database...

docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐳 Starting MySQL with Docker...
    docker run --name mysql-email-extraction -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=email_extraction -p 3306:3306 -d mysql:8.0
    
    echo ⏳ Waiting for MySQL to start...
    timeout /t 10 /nobreak >nul
    
    echo 📊 Setting up database schema...
    mysql -h localhost -u root -proot email_extraction < db-setup.sql
    
    echo ✅ Database setup completed!
) else (
    echo ⚠️  Docker not available. Please set up MySQL manually and run:
    echo    mysql -h localhost -u root -p ^< db-setup.sql
)
goto end

:exit
echo 👋 Goodbye!
exit /b 0

:end
echo.
echo 🎉 Deployment completed!
echo 📖 Check DEPLOYMENT.md for detailed instructions and troubleshooting.
pause
