#!/bin/bash

# DreamWeaver Local Development Setup Script
echo "🚀 Setting up DreamWeaver local development environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your actual credentials"
    echo "   Required: DATABASE_URL (from Railway), OPENROUTER_API_KEY"
    echo ""
    echo "   Get DATABASE_URL from Railway dashboard -> PostgreSQL service -> Variables"
    echo "   Get OPENROUTER_API_KEY from https://openrouter.ai/"
    exit 1
fi

# Create local storage directory
echo "📁 Creating local storage directory..."
mkdir -p storage/stories
mkdir -p storage/illustrations
mkdir -p storage/profiles
mkdir -p storage/temp

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Create database migration directory
echo "📁 Creating database migration structure..."
mkdir -p migrations

# Check PostgreSQL connection
echo "🔍 Checking database connection..."
cd server && npm run db:check 2>/dev/null || echo "⚠️  Database connection not configured. Please update DATABASE_URL in .env.local"
cd ..

echo "✅ Local development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your credentials"
echo "2. Run 'npm run dev' to start both client and server"
echo "3. Client: http://localhost:5173"
echo "4. Server: http://localhost:3000"
echo ""
echo "🚆 Railway Compatibility Notes:"
echo "- Keep package.json scripts aligned with Railway deployment"
echo "- Test builds with 'npm run build' before deploying"
echo "- Use environment variables consistently between local and Railway"