# Delayed Repository Clone Script
# Creates "The Atom Project" folder in D:\ and clones the repository after 1 hour delay

param(
    [string]$TargetPath = "D:\The Atom Project",
    [string]$RepoUrl = "https://github.com/DarnedMoon85/the_atom_project.git",
    [int]$DelayHours = 1
)

Write-Host "=== Delayed Repository Clone Script ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target Path: $TargetPath" -ForegroundColor White
Write-Host "Repository: $RepoUrl" -ForegroundColor White
Write-Host "Delay: $DelayHours hour(s)" -ForegroundColor White
Write-Host ""

# Check if target path already exists
if (Test-Path $TargetPath) {
    Write-Host "⚠️  Warning: Target path already exists: $TargetPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to continue? This will clone into the existing folder. (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Creating target directory..." -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
        Write-Host "✅ Directory created: $TargetPath" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error creating directory: $_" -ForegroundColor Red
        exit 1
    }
}

# Calculate delay time
$delaySeconds = $DelayHours * 3600
$endTime = (Get-Date).AddSeconds($delaySeconds)

Write-Host ""
Write-Host "⏳ Waiting $DelayHours hour(s) before cloning..." -ForegroundColor Cyan
Write-Host "Start time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "Clone will start at: $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
Write-Host ""
Write-Host "You can close this window - the script will continue in the background." -ForegroundColor Yellow
Write-Host "Or press Ctrl+C to cancel." -ForegroundColor Yellow
Write-Host ""

# Countdown timer
$remainingSeconds = $delaySeconds
while ($remainingSeconds -gt 0) {
    $hours = [math]::Floor($remainingSeconds / 3600)
    $minutes = [math]::Floor(($remainingSeconds % 3600) / 60)
    $seconds = $remainingSeconds % 60
    
    $timeString = "{0:00}:{1:00}:{2:00}" -f $hours, $minutes, $seconds
    Write-Host "`rTime remaining: $timeString" -NoNewline -ForegroundColor Cyan
    
    Start-Sleep -Seconds 1
    $remainingSeconds--
}

Write-Host ""
Write-Host ""
Write-Host "⏰ Delay complete! Starting clone operation..." -ForegroundColor Green
Write-Host ""

# Check if directory is empty or doesn't exist
$isEmpty = -not (Test-Path $TargetPath) -or ((Get-ChildItem $TargetPath -Force -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0)

if ($isEmpty) {
    Write-Host "Cloning repository..." -ForegroundColor Yellow
    try {
        Push-Location (Split-Path $TargetPath -Parent)
        git clone $RepoUrl "$TargetPath"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Repository cloned successfully!" -ForegroundColor Green
            Write-Host "Location: $TargetPath" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "To navigate to the project:" -ForegroundColor White
            Write-Host "  cd `"$TargetPath`"" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Clone failed. Error code: $LASTEXITCODE" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "❌ Error during clone: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
} else {
    Write-Host "Target directory is not empty. Attempting to pull instead..." -ForegroundColor Yellow
    
    # Check if it's a git repository
    $gitDir = Join-Path $TargetPath ".git"
    if (Test-Path $gitDir) {
        Write-Host "Existing git repository found. Pulling latest changes..." -ForegroundColor Yellow
        try {
            Push-Location $TargetPath
            git pull origin main
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Repository updated successfully!" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "⚠️  Pull completed with warnings. Check the output above." -ForegroundColor Yellow
            }
        } catch {
            Write-Host ""
            Write-Host "❌ Error during pull: $_" -ForegroundColor Red
            exit 1
        } finally {
            Pop-Location
        }
    } else {
        Write-Host ""
        Write-Host "❌ Target directory exists but is not a git repository." -ForegroundColor Red
        Write-Host "Please remove or rename the existing directory and try again." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Operation complete!" -ForegroundColor Green
