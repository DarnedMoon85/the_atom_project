# GitHub Setup Script for The Adom Project
# Run this script to help set up GitHub authentication

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if repository exists
Write-Host "Step 1: Create Repository on GitHub" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: the_adom_project" -ForegroundColor White
Write-Host "3. Description: Co-Executive Intelligence System - Atomic Engine" -ForegroundColor White
Write-Host "4. Choose Public or Private" -ForegroundColor White
Write-Host "5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""
$createRepo = Read-Host "Have you created the repository? (y/n)"

if ($createRepo -ne "y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 2: Choose Authentication Method" -ForegroundColor Yellow
Write-Host "A) Personal Access Token (Easier, recommended)" -ForegroundColor White
Write-Host "B) SSH Key (More secure, one-time setup)" -ForegroundColor White
Write-Host ""
$authMethod = Read-Host "Choose method (A/B)"

if ($authMethod -eq "A" -or $authMethod -eq "a") {
    Write-Host ""
    Write-Host "=== Personal Access Token Setup ===" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "3. Name: The Adom Project" -ForegroundColor White
    Write-Host "4. Select scope: repo (full control)" -ForegroundColor White
    Write-Host "5. Click 'Generate token'" -ForegroundColor White
    Write-Host "6. COPY THE TOKEN (you won't see it again!)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After creating the token, run:" -ForegroundColor Green
    Write-Host "  git push --set-upstream origin main" -ForegroundColor Green
    Write-Host "  Username: DarnedMoon85" -ForegroundColor Green
    Write-Host "  Password: [paste your token]" -ForegroundColor Green
}
elseif ($authMethod -eq "B" -or $authMethod -eq "b") {
    Write-Host ""
    Write-Host "=== SSH Key Setup ===" -ForegroundColor Cyan
    
    # Check if SSH key exists
    $sshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519.pub"
    if (Test-Path $sshKeyPath) {
        Write-Host "SSH key found at: $sshKeyPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your public key:" -ForegroundColor Yellow
        Get-Content $sshKeyPath
        Write-Host ""
        Write-Host "1. Copy the key above" -ForegroundColor White
        Write-Host "2. Go to: https://github.com/settings/keys" -ForegroundColor White
        Write-Host "3. Click 'New SSH key'" -ForegroundColor White
        Write-Host "4. Title: The Adom Project" -ForegroundColor White
        Write-Host "5. Paste your key and click 'Add SSH key'" -ForegroundColor White
        Write-Host ""
        Write-Host "After adding the key, run:" -ForegroundColor Green
        Write-Host "  git remote set-url origin git@github.com:DarnedMoon85/the_adom_project.git" -ForegroundColor Green
        Write-Host "  git push --set-upstream origin main" -ForegroundColor Green
    }
    else {
        Write-Host "No SSH key found. Generating one..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Generating SSH key..." -ForegroundColor Cyan
        ssh-keygen -t ed25519 -C "darnedmoon85@gmail.com" -f "$env:USERPROFILE\.ssh\id_ed25519" -N '""'
        
        if (Test-Path "$env:USERPROFILE\.ssh\id_ed25519.pub") {
            Write-Host ""
            Write-Host "SSH key generated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Your public key:" -ForegroundColor Yellow
            Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
            Write-Host ""
            Write-Host "1. Copy the key above" -ForegroundColor White
            Write-Host "2. Go to: https://github.com/settings/keys" -ForegroundColor White
            Write-Host "3. Click 'New SSH key'" -ForegroundColor White
            Write-Host "4. Title: The Adom Project" -ForegroundColor White
            Write-Host "5. Paste your key and click 'Add SSH key'" -ForegroundColor White
            Write-Host ""
            Write-Host "After adding the key, run:" -ForegroundColor Green
            Write-Host "  git remote set-url origin git@github.com:DarnedMoon85/the_adom_project.git" -ForegroundColor Green
            Write-Host "  git push --set-upstream origin main" -ForegroundColor Green
        }
        else {
            Write-Host "Failed to generate SSH key. Please generate manually." -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Setup instructions complete!" -ForegroundColor Green
