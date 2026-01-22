# Push to GitHub Script - Fixed Version
# This script will help you push your code to GitHub

Write-Host "=== Push to GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not a git repository. Run 'git init' first." -ForegroundColor Red
    exit 1
}

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Green
} else {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin https://github.com/DarnedMoon85/the_adom_project.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to add remote" -ForegroundColor Red
        exit 1
    }
}

# Check current branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch to 'main'..." -ForegroundColor Yellow
    git branch -M main
}

# Check if repository exists on GitHub
Write-Host ""
Write-Host "Checking if repository exists on GitHub..." -ForegroundColor Yellow
$repoCheck = git ls-remote --heads origin main 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠ Repository not found on GitHub!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create the repository first:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name: the_adom_project" -ForegroundColor White
    Write-Host "3. Description: Co-Executive Intelligence System - Atomic Engine" -ForegroundColor White
    Write-Host "4. Choose Public or Private" -ForegroundColor White
    Write-Host "5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
    Write-Host "6. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    $createRepo = Read-Host "Have you created the repository? (y/n)"
    
    if ($createRepo -ne "y" -and $createRepo -ne "Y") {
        Write-Host "Please create the repository first, then run this script again." -ForegroundColor Red
        exit 1
    }
}

# Check if we have commits to push
$commitsAhead = git rev-list --count origin/main..HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
    $commitsAhead = (git log --oneline | Measure-Object -Line).Lines
}

Write-Host ""
Write-Host "Ready to push!" -ForegroundColor Green
Write-Host "Commits to push: $commitsAhead" -ForegroundColor White
Write-Host ""

# Try to push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push --set-upstream origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "1. Repository doesn't exist on GitHub (create it first)" -ForegroundColor Yellow
    Write-Host "2. Authentication required (use Personal Access Token)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For authentication help, see GITHUB_SETUP.md" -ForegroundColor Cyan
    Write-Host "Or run: .\setup-github.ps1" -ForegroundColor Cyan
}
