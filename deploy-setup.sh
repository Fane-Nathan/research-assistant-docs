#!/bin/bash
# StudyAssistant Documentation Deployment Script

echo "🚀 StudyAssistant Documentation Deployment"
echo "=========================================="
echo ""

echo "Choose your deployment option:"
echo "1. Create new repository: studyassistant-docs"
echo "2. Use existing StudyAssistant repository (if it exists)"
echo "3. Deploy to alternative hosting (Netlify/Vercel)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "📁 Creating new repository: studyassistant-docs"
        echo ""
        echo "Please follow these steps:"
        echo "1. Go to https://github.com/new"
        echo "2. Repository name: studyassistant-docs"
        echo "3. Description: 'Comprehensive documentation for StudyAssistant RAG system'"
        echo "4. Make it Public"
        echo "5. Don't initialize with README (we already have content)"
        echo "6. Click 'Create repository'"
        echo ""
        echo "After creating the repository, run:"
        echo "git remote add origin https://github.com/Fane-Nathan/studyassistant-docs.git"
        echo "git push -u origin master"
        echo ""
        echo "Then enable GitHub Pages:"
        echo "- Go to repository Settings > Pages"
        echo "- Source: GitHub Actions"
        echo "- The site will be available at: https://fane-nathan.github.io/studyassistant-docs/"
        ;;
    2)
        echo "📂 Using existing StudyAssistant repository"
        echo ""
        echo "If the repository exists, create a 'docs' folder and add documentation there."
        echo "You may need to adjust the baseUrl in docusaurus.config.ts"
        ;;
    3)
        echo "🌐 Alternative hosting options"
        echo ""
        echo "For Netlify:"
        echo "1. Push to any Git repository"
        echo "2. Connect to Netlify"
        echo "3. Build command: npm run build"
        echo "4. Publish directory: build"
        echo ""
        echo "For Vercel:"
        echo "1. Push to GitHub"
        echo "2. Import to Vercel"
        echo "3. Auto-deployment will be configured"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac
