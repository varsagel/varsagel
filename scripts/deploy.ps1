param(
    [string]$Target = "production",
    [string]$Action = "deploy"
)

$targetKey = $Target.ToLower()
if ($targetKey -ne "production" -and $targetKey -ne "staging") {
    $targetKey = "production"
}

$actionKey = $Action.ToLower()
$allowedActions = @("deploy", "pull", "install", "build", "restart")
if (!($allowedActions -contains $actionKey)) {
    $actionKey = "deploy"
}

$logFile = "$PSScriptRoot\..\logs\deploy-$targetKey.log"
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

Log-Message "Starting deployment process: target=$targetKey action=$actionKey"

try {
    Set-Location $projectRoot

    $shouldPull = $actionKey -in @("deploy", "pull")
    $shouldInstall = $actionKey -in @("deploy", "install")
    $shouldBuild = $actionKey -in @("deploy", "build")
    $shouldRestart = $actionKey -in @("deploy", "restart")

    if ($shouldPull) {
        Log-Message "Pulling latest changes from git..."
        $gitOutput = git pull 2>&1
        Log-Message $gitOutput
        if ($LASTEXITCODE -ne 0) {
            throw "Git pull failed."
        }
    }

    if ($shouldInstall) {
        Log-Message "Installing dependencies..."
        $npmInstall = npm install --legacy-peer-deps 2>&1
        Log-Message $npmInstall
        if ($LASTEXITCODE -ne 0) {
            throw "NPM install failed."
        }
    }

    if ($shouldBuild) {
        $nextStatic = Join-Path $projectRoot ".next\static"
        $nextStaticPrev = Join-Path $projectRoot ".next-static-prev"
        if (Test-Path $nextStatic) {
            Log-Message "Backing up .next/static to .next-static-prev..."
            if (Test-Path $nextStaticPrev) {
                Remove-Item -Recurse -Force $nextStaticPrev
            }
            New-Item -ItemType Directory -Path $nextStaticPrev -Force | Out-Null
            Copy-Item -Path (Join-Path $nextStatic "*") -Destination $nextStaticPrev -Recurse -Force
        }

        $buildCommand = if ($targetKey -eq "staging") { "build:staging" } else { "build" }
        Log-Message "Building project ($buildCommand)..."
        $npmBuild = npm run $buildCommand 2>&1
        Log-Message $npmBuild
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed."
        }

        Log-Message "Validating critical chunks..."
        $chunkDir = Join-Path $projectRoot ".next\static\chunks\app\kategori\[category]\[...subcategory]"
        if (!(Test-Path -LiteralPath $chunkDir)) {
            throw "Chunk directory missing: $chunkDir"
        }
        $chunkFiles = Get-ChildItem -LiteralPath $chunkDir -Filter "page-*.js" -File -ErrorAction SilentlyContinue
        if (!$chunkFiles -or $chunkFiles.Count -eq 0) {
            throw "Chunk files missing in: $chunkDir"
        }
        Log-Message ("Chunk OK: " + ($chunkFiles | Select-Object -First 1 -ExpandProperty Name))
    }

    if ($shouldRestart) {
        Log-Message "Attempting to restart server via PM2..."
        if (Get-Command pm2 -ErrorAction SilentlyContinue) {
            $pm2Name = if ($targetKey -eq "staging") { "varsagel-staging" } else { "varsagel" }
            $pm2Output = pm2 restart $pm2Name 2>&1
            Log-Message $pm2Output
            if ($LASTEXITCODE -ne 0) {
                Log-Message "Restart failed, trying ecosystem reload..."
                $ecoFile = if ($targetKey -eq "staging") { "ecosystem.staging.config.js" } else { "ecosystem.config.js" }
                $pm2Reload = pm2 reload $ecoFile --env production 2>&1
                Log-Message $pm2Reload
            }
        } else {
            Log-Message "PM2 not found. Manual restart required."
            Log-Message "If you are running via 'npm run dev', please restart the terminal."
        }
    }

    Log-Message "Deployment completed successfully!"

} catch {
    Log-Message "ERROR: $_"
    exit 1
}
