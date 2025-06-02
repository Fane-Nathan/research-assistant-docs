# StudyAssistant Documentation Deployment Script
# PowerShell version for Windows

Write-Host "🚀 StudyAssistant Documentation Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose your deployment option:" -ForegroundColor Yellow
Write-Host "1. Create new repository: studyassistant-docs" -ForegroundColor Green
Write-Host "2. Use existing StudyAssistant repository (if it exists)" -ForegroundColor Green  
Write-Host "3. Deploy to alternative hosting (Netlify/Vercel)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "📁 Creating new repository: studyassistant-docs" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "Please follow these steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://github.com/new" -ForegroundColor White
        Write-Host "2. Repository name: studyassistant-docs" -ForegroundColor White
        Write-Host "3. Description: 'Comprehensive documentation for StudyAssistant RAG system'" -ForegroundColor White
        Write-Host "4. Make it Public" -ForegroundColor White
        Write-Host "5. Don't initialize with README (we already have content)" -ForegroundColor White
        Write-Host "6. Click 'Create repository'" -ForegroundColor White
        Write-Host ""
        Write-Host "After creating the repository, run these commands:" -ForegroundColor Yellow
        Write-Host "git remote add origin https://github.com/Fane-Nathan/studyassistant-docs.git" -ForegroundColor Cyan
        Write-Host "git push -u origin master" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then enable GitHub Pages:" -ForegroundColor Yellow
        Write-Host "- Go to repository Settings > Pages" -ForegroundColor White
        Write-Host "- Source: GitHub Actions" -ForegroundColor White
        Write-Host "- The site will be available at: https://fane-nathan.github.io/studyassistant-docs/" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Would you like me to open GitHub in your browser? (y/n)" -ForegroundColor Yellow
        $openBrowser = Read-Host
        if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
            Start-Process "https://github.com/new"
        }
    }
    "2" {
        Write-Host "📂 Using existing StudyAssistant repository" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "If the repository exists, you'll need to:" -ForegroundColor Yellow
        Write-Host "1. Create a 'docs' folder in the main repository" -ForegroundColor White
        Write-Host "2. Move this documentation there" -ForegroundColor White
        Write-Host "3. Adjust the baseUrl in docusaurus.config.ts" -ForegroundColor White
    }
    "3" {
        Write-Host "🌐 Alternative hosting options" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "For Netlify:" -ForegroundColor Yellow
        Write-Host "1. Push to any Git repository" -ForegroundColor White
        Write-Host "2. Connect to Netlify" -ForegroundColor White
        Write-Host "3. Build command: npm run build" -ForegroundColor White
        Write-Host "4. Publish directory: build" -ForegroundColor White
        Write-Host ""
        Write-Host "For Vercel:" -ForegroundColor Yellow
        Write-Host "1. Push to GitHub" -ForegroundColor White
        Write-Host "2. Import to Vercel" -ForegroundColor White
        Write-Host "3. Auto-deployment will be configured" -ForegroundColor White
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📖 Documentation is ready to deploy!" -ForegroundColor Green
Write-Host "Your enhanced StudyAssistant documentation includes:" -ForegroundColor Cyan
Write-Host "- Modern UI with StudyAssistant branding" -ForegroundColor White
Write-Host "- Comprehensive documentation structure" -ForegroundColor White
Write-Host "- Automatic GitHub Pages deployment workflow" -ForegroundColor White
Write-Host "- Mobile-responsive design" -ForegroundColor White
