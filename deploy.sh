#!/bin/bash

# Email Extraction Application - Quick Deployment Script
# This script helps you deploy the application to different platforms

set -e

echo "🚀 Email Extraction Application - Deployment Script"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 16 ]; then
            echo "❌ Node.js version 16 or higher is required. Current version: $(node --version)"
            exit 1
        fi
        echo "✅ Node.js version: $(node --version)"
    else
        echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        echo "✅ Docker is installed"
        if command_exists docker-compose; then
            echo "✅ Docker Compose is installed"
        else
            echo "⚠️  Docker Compose is not installed. Please install it."
        fi
    else
        echo "⚠️  Docker is not installed. Some deployment options will not be available."
    fi
}

# Function to build frontend
build_frontend() {
    echo "📦 Building frontend..."
    npm install
    npm run build
    echo "✅ Frontend built successfully"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    if ! command_exists vercel; then
        echo "📥 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🔧 Deploying frontend..."
    vercel --prod
    
    echo "🔧 Deploying backend..."
    cd backend
    vercel --prod
    cd ..
    
    echo "✅ Vercel deployment completed!"
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    if ! command_exists docker; then
        echo "❌ Docker is required for this deployment option"
        exit 1
    fi
    
    echo "🔨 Building Docker images..."
    docker-compose build
    
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo "✅ Docker deployment completed!"
    echo "🌐 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:5000"
    echo "   AI Service: http://localhost:8001"
}

# Function to setup database
setup_database() {
    echo "🗄️  Setting up database..."
    
    if command_exists docker; then
        echo "🐳 Starting MySQL with Docker..."
        docker run --name mysql-email-extraction \
            -e MYSQL_ROOT_PASSWORD=root \
            -e MYSQL_DATABASE=email_extraction \
            -p 3306:3306 \
            -d mysql:8.0
        
        echo "⏳ Waiting for MySQL to start..."
        sleep 10
        
        echo "📊 Setting up database schema..."
        mysql -h localhost -u root -proot email_extraction < db-setup.sql
        
        echo "✅ Database setup completed!"
    else
        echo "⚠️  Docker not available. Please set up MySQL manually and run:"
        echo "   mysql -h localhost -u root -p < db-setup.sql"
    fi
}

# Function to show deployment options
show_options() {
    echo ""
    echo "📋 Available Deployment Options:"
    echo "1. Vercel (Recommended - Frontend + Backend)"
    echo "2. Docker (Local/Cloud - Full Stack)"
    echo "3. Build Only (Prepare for manual deployment)"
    echo "4. Setup Database Only"
    echo "5. Exit"
    echo ""
}

# Main script
main() {
    check_node_version
    check_docker
    
    while true; do
        show_options
        read -p "Choose an option (1-5): " choice
        
        case $choice in
            1)
                build_frontend
                deploy_vercel
                break
                ;;
            2)
                build_frontend
                deploy_docker
                break
                ;;
            3)
                build_frontend
                echo "✅ Build completed! Check the 'dist' folder for the frontend build."
                echo "📁 Backend is ready in the 'backend' folder."
                echo "🐍 Python AI service is ready in the 'EMAILS_EXT' folder."
                break
                ;;
            4)
                setup_database
                break
                ;;
            5)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid option. Please choose 1-5."
                ;;
        esac
    done
    
    echo ""
    echo "🎉 Deployment completed!"
    echo "📖 Check DEPLOYMENT.md for detailed instructions and troubleshooting."
}

# Run main function
main "$@"
