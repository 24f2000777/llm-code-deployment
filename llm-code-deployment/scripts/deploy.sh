#!/bin/bash

# Deployment Helper Script for LLM Code Deployment
# This script helps deploy the server to various platforms

echo "🚀 LLM Code Deployment - Deployment Helper"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Run 'npm run setup' first"
    exit 1
fi

echo "Select deployment option:"
echo "1. Deploy locally (for testing)"
echo "2. Deploy to Heroku"
echo "3. Deploy to Railway"
echo "4. Deploy to Render"
echo "5. Generate deployment instructions"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 Starting local deployment..."
        echo ""
        npm install
        npm start
        ;;
    
    2)
        echo ""
        echo "📦 Deploying to Heroku..."
        echo ""
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not installed"
            echo "Install from: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        echo "Creating Heroku app..."
        heroku create
        
        echo "Setting environment variables..."
        echo "⚠️  You need to set these manually:"
        echo "heroku config:set STUDENT_EMAIL=your-email"
        echo "heroku config:set USERCODE=your-code"
        echo "heroku config:set GITHUB_TOKEN=your-token"
        echo "heroku config:set GITHUB_USERNAME=your-username"
        echo "heroku config:set OPENAI_API_KEY=your-key"
        
        echo ""
        echo "Deploy with: git push heroku main"
        ;;
    
    3)
        echo ""
        echo "📦 Railway Deployment Instructions:"
        echo ""
        echo "1. Go to https://railway.app/"
        echo "2. Create new project from GitHub repo"
        echo "3. Add environment variables from your .env file"
        echo "4. Railway will auto-deploy"
        ;;
    
    4)
        echo ""
        echo "📦 Render Deployment Instructions:"
        echo ""
        echo "1. Go to https://render.com/"
        echo "2. Create new Web Service"
        echo "3. Connect your GitHub repository"
        echo "4. Set build command: npm install"
        echo "5. Set start command: npm start"
        echo "6. Add environment variables from your .env file"
        ;;
    
    5)
        echo ""
        echo "📋 General Deployment Instructions:"
        echo ""
        echo "Requirements for any platform:"
        echo "- Node.js 16+ support"
        echo "- Environment variables from .env"
        echo "- Persistent storage for logs (optional)"
        echo ""
        echo "Start command: npm start"
        echo "Build command: npm install"
        echo ""
        echo "Required environment variables:"
        grep -v '^#' .env | grep '=' | cut -d '=' -f 1
        ;;
    
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac