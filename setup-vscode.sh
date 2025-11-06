#!/bin/bash

# StoryForge VS Code Setup Script
echo "🚀 Setting up StoryForge for VS Code development..."

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please ensure your environment variables are configured."
    exit 1
fi

echo "✅ Environment variables configured"

# Optional: Install Supabase CLI
read -p "📝 Do you want to install Supabase CLI for local edge function testing? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Open VS Code and install recommended extensions"
echo "   3. Visit http://localhost:8080 to see your app"
echo ""
echo "📚 For more info, check README.md"
