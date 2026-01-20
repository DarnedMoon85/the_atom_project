# Create GitHub Repository Script
# This script will create the repository on GitHub using the API

param(
    [string]$Token = "",
    [string]$RepoName = "the_atom_project",
    [string]$Description = "Co-Executive Intelligence System - Atomic Engine",
    [string]$Visibility = "private"  # or "public"
)

Write-Host "=== Create GitHub Repository ===" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is available
$ghAvailable = Get-Command gh -ErrorAction SilentlyContinue

if ($ghAvailable) {
    Write-Host "✅ GitHub CLI found! Using 'gh' command..." -ForegroundColor Green
    Write-Host ""
    
    # Check if user is authenticated
    $ghAuth = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "GitHub CLI not authenticated. Authenticating..." -ForegroundColor Yellow
        gh auth login
    }
    
    Write-Host "Creating repository: $RepoName" -ForegroundColor Yellow
    
    if ($Visibility -eq "public") {
        gh repo create $RepoName --description "$Description" --public --source=. --remote=origin --push
    } else {
        gh repo create $RepoName --description "$Description" --private --source=. --remote=origin --push
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Repository created and code pushed successfully!" -ForegroundColor Green
        Write-Host "View at: https://github.com/DarnedMoon85/$RepoName" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Failed to create repository with GitHub CLI" -ForegroundColor Red
        Write-Host "Falling back to API method..." -ForegroundColor Yellow
        $ghAvailable = $false
    }
}

if (-not $ghAvailable) {
    Write-Host "Using GitHub API method..." -ForegroundColor Yellow
    Write-Host ""
    
    # Get token if not provided
    if (-not $Token) {
        Write-Host "You need a Personal Access Token to create the repository." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor White
        Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
        Write-Host "3. Name: Create Repository Script" -ForegroundColor White
        Write-Host "4. Select scope: 'repo' (full control)" -ForegroundColor White
        Write-Host "5. Click 'Generate token' and copy it" -ForegroundColor White
        Write-Host ""
        $secureToken = Read-Host "Enter your Personal Access Token" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
        $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    }
    
    if (-not $Token) {
        Write-Host "❌ Token required. Exiting." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Creating repository via GitHub API..." -ForegroundColor Yellow
    
    # Prepare API request
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "PowerShell"
    }
    
    $body = @{
        name = $RepoName
        description = $Description
        private = ($Visibility -eq "private")
        auto_init = $false
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
            -Method Post `
            -Headers $headers `
            -Body $body `
            -ContentType "application/json"
        
        Write-Host "✅ Repository created successfully!" -ForegroundColor Green
        Write-Host "Repository URL: $($response.html_url)" -ForegroundColor Cyan
        Write-Host ""
        
        # Update remote URL to match
        $currentRemote = git remote get-url origin 2>$null
        if ($currentRemote -ne $response.clone_url) {
            Write-Host "Updating remote URL..." -ForegroundColor Yellow
            git remote set-url origin $response.clone_url
        }
        
        # Push the code
        Write-Host ""
        Write-Host "Pushing code to repository..." -ForegroundColor Yellow
        
        # Configure credential helper for this push
        $env:GIT_ASKPASS = "echo"
        $env:GIT_USERNAME = "DarnedMoon85"
        $env:GIT_PASSWORD = $Token
        
        # Use token in URL for authentication
        $pushUrl = $response.clone_url -replace "https://", "https://$Token@"
        git remote set-url origin $pushUrl
        
        git push --set-upstream origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Code pushed successfully!" -ForegroundColor Green
            Write-Host "View your repository at: $($response.html_url)" -ForegroundColor Cyan
            
            # Reset remote to normal URL (without token)
            git remote set-url origin $response.clone_url
        } else {
            Write-Host ""
            Write-Host "⚠️  Repository created but push failed." -ForegroundColor Yellow
            Write-Host "You can push manually with:" -ForegroundColor White
            Write-Host "  git push --set-upstream origin main" -ForegroundColor Green
            Write-Host "  Username: DarnedMoon85" -ForegroundColor Green
            Write-Host "  Password: [your token]" -ForegroundColor Green
            
            # Reset remote to normal URL
            git remote set-url origin $response.clone_url
        }
        
    } catch {
        Write-Host ""
        Write-Host "❌ Error creating repository:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host ""
            Write-Host "Authentication failed. Check your token." -ForegroundColor Yellow
        } elseif ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host ""
            Write-Host "Repository might already exist or name is invalid." -ForegroundColor Yellow
        }
        
        exit 1
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
