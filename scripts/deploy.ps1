# Varsagel Deployment Script
$logFile = "$PSScriptRoot\..\logs\deploy.log"
$projectRoot = "$PSScriptRoot\.."

# Create logs directory if it doesn't exist
$logDir = Split-Path $logFile -Parent
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

function Log-Message($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $msg"
    Write-Output $logEntry
    $logEntry | Out-File -FilePath $logFile -Append -Encoding utf8
}

Log-Message "Starting deployment process..."

try {
    Set-Location $projectRoot

    # 1. Git Pull
    Log-Message "Pulling latest changes from git..."
    $gitOutput = git pull 2>&1
    Log-Message $gitOutput
    if ($LASTEXITCODE -ne 0) {
        throw "Git pull failed."
    }

    # 2. Install Dependencies
    Log-Message "Installing dependencies..."
    $npmInstall = npm install --legacy-peer-deps 2>&1
    Log-Message $npmInstall
    if ($LASTEXITCODE -ne 0) {
        throw "NPM install failed."
    }

    # 3. Build
    Log-Message "Building project..."
    $npmBuild = npm run build 2>&1
    Log-Message $npmBuild
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed."
    }

    # 4. Restart Server (Try PM2)
    Log-Message "Attempting to restart server via PM2..."
    if (Get-Command pm2 -ErrorAction SilentlyContinue) {
        $pm2Output = pm2 restart varsagel 2>&1
        Log-Message $pm2Output
        if ($LASTEXITCODE -ne 0) {
            # Try reloading ecosystem if restart fails (maybe first run)
             Log-Message "Restart failed, trying ecosystem reload..."
             $pm2Reload = pm2 reload ecosystem.config.js --env production 2>&1
             Log-Message $pm2Reload
        }
    } else {
        Log-Message "PM2 not found. Manual restart required."
        Log-Message "If you are running via 'npm run dev', please restart the terminal."
    }

    Log-Message "Deployment completed successfully!"

} catch {
    Log-Message "ERROR: $_"
    exit 1
}
