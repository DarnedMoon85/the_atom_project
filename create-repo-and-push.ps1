# Create GitHub Repository and Push Script
# This script will guide you through creating the repo and pushing your code

Write-Host "=== Create GitHub Repository and Push ===" -ForegroundColor Cyan
Write-Host ""

# Check if repository exists
Write-Host "Checking if repository exists on GitHub..." -ForegroundColor Yellow
$repoCheck = git ls-remote --heads origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository exists! Pushing code..." -ForegroundColor Green
    git push --set-upstream origin main
    exit
}

Write-Host "❌ Repository not found on GitHub" -ForegroundColor Red
Write-Host ""

# Step 1: Create Repository
Write-Host "=== STEP 1: Create Repository on GitHub ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open this URL in your browser:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Fill in the form:" -ForegroundColor White
Write-Host "   Repository name: the_adom_project" -ForegroundColor Green
Write-Host "   Description: Co-Executive Intelligence System - Atomic Engine" -ForegroundColor Green
Write-Host "   Visibility: Public or Private (your choice)" -ForegroundColor Green
Write-Host ""
Write-Host "3. IMPORTANT: DO NOT check any of these:" -ForegroundColor Red
Write-Host "   ❌ Add a README file" -ForegroundColor Red
Write-Host "   ❌ Add .gitignore" -ForegroundColor Red
Write-Host "   ❌ Choose a license" -ForegroundColor Red
Write-Host ""
Write-Host "4. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$created = Read-Host "Have you created the repository? (y/n)"

if ($created -ne "y" -and $created -ne "Y") {
    Write-Host ""
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Red
    Write-Host "Or run: git push --set-upstream origin main" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "=== STEP 2: Authentication ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "GitHub requires authentication. Choose your method:" -ForegroundColor White
Write-Host ""
Write-Host "A) Personal Access Token (Recommended - Easy)" -ForegroundColor Cyan
Write-Host "B) SSH Key (More secure, one-time setup)" -ForegroundColor Cyan
Write-Host ""
$authChoice = Read-Host "Choose (A/B)"

if ($authChoice -eq "A" -or $authChoice -eq "a") {
    Write-Host ""
    Write-Host "=== Personal Access Token Setup ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "3. Name: The Adom Project" -ForegroundColor White
    Write-Host "4. Expiration: Choose your preference (90 days recommended)" -ForegroundColor White
    Write-Host "5. Select scope: Check 'repo' (full control of private repositories)" -ForegroundColor White
    Write-Host "6. Click 'Generate token' at the bottom" -ForegroundColor White
    Write-Host "7. ⚠️  COPY THE TOKEN NOW (you won't see it again!)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "When you push, use:" -ForegroundColor Green
    Write-Host "  Username: DarnedMoon85" -ForegroundColor White
    Write-Host "  Password: [paste your token]" -ForegroundColor White
    Write-Host ""
    $ready = Read-Host "Ready to push? (y/n)"
    
    if ($ready -eq "y" -or $ready -eq "Y") {
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        Write-Host "(You'll be prompted for username and password/token)" -ForegroundColor Gray
        Write-Host ""
        git push --set-upstream origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host "View your repository at:" -ForegroundColor Cyan
            Write-Host "https://github.com/DarnedMoon85/the_adom_project" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ Push failed. Make sure:" -ForegroundColor Red
            Write-Host "1. Repository exists on GitHub" -ForegroundColor Yellow
            Write-Host "2. You used the Personal Access Token (not password)" -ForegroundColor Yellow
        }
    }
}
elseif ($authChoice -eq "B" -or $authChoice -eq "b") {
    Write-Host ""
    Write-Host "=== SSH Key Setup ===" -ForegroundColor Cyan
    
    # Check for existing SSH key
    $sshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519.pub"
    $sshKeyExists = Test-Path $sshKeyPath
    
    if (-not $sshKeyExists) {
        $sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa.pub"
        $sshKeyExists = Test-Path $sshKeyPath
    }
    
    if ($sshKeyExists) {
        Write-Host "✅ SSH key found!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your public key:" -ForegroundColor Yellow
        Get-Content $sshKeyPath
        Write-Host ""
        Write-Host "1. Copy the key above" -ForegroundColor White
        Write-Host "2. Go to: https://github.com/settings/keys" -ForegroundColor White
        Write-Host "3. Click 'New SSH key'" -ForegroundColor White
        Write-Host "4. Title: The Adom Project" -ForegroundColor White
        Write-Host "5. Key type: Authentication Key" -ForegroundColor White
        Write-Host "6. Paste your key and click 'Add SSH key'" -ForegroundColor White
        Write-Host ""
        $keyAdded = Read-Host "Have you added the SSH key to GitHub? (y/n)"
        
        if ($keyAdded -eq "y" -or $keyAdded -eq "Y") {
            Write-Host ""
            Write-Host "Switching to SSH URL..." -ForegroundColor Yellow
            git remote set-url origin git@github.com:DarnedMoon85/the_adom_project.git
            
            Write-Host ""
            Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
            git push --set-upstream origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
                Write-Host "View your repository at:" -ForegroundColor Cyan
                Write-Host "https://github.com/DarnedMoon85/the_adom_project" -ForegroundColor Cyan
            }
        }
    }
    else {
        Write-Host "No SSH key found. Generating one..." -ForegroundColor Yellow
        Write-Host ""
        
        # Ensure .ssh directory exists
        $sshDir = "$env:USERPROFILE\.ssh"
        if (-not (Test-Path $sshDir)) {
            New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
        }
        
        Write-Host "Generating SSH key (press Enter for default location, optionally set passphrase)..." -ForegroundColor Cyan
        ssh-keygen -t ed25519 -C "your-email@example.com" -f "$env:USERPROFILE\.ssh\id_ed25519"
        
        if (Test-Path "$env:USERPROFILE\.ssh\id_ed25519.pub") {
            Write-Host ""
            Write-Host "✅ SSH key generated!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Your public key:" -ForegroundColor Yellow
            Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
            Write-Host ""
            Write-Host "1. Copy the key above" -ForegroundColor White
            Write-Host "2. Go to: https://github.com/settings/keys" -ForegroundColor White
            Write-Host "3. Click 'New SSH key'" -ForegroundColor White
            Write-Host "4. Title: The Adom Project" -ForegroundColor White
            Write-Host "5. Key type: Authentication Key" -ForegroundColor White
            Write-Host "6. Paste your key and click 'Add SSH key'" -ForegroundColor White
            Write-Host ""
            Write-Host "After adding the key, run this script again or:" -ForegroundColor Yellow
            Write-Host "  git remote set-url origin git@github.com:DarnedMoon85/the_adom_project.git" -ForegroundColor Green
            Write-Host "  git push --set-upstream origin main" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
