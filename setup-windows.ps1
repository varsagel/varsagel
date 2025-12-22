# 🪟 Varsagel Windows Setup Script
# Run as Administrator in PowerShell

Write-Host "🚀 Starting Varsagel Windows Setup..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Create logs directory
Write-Host "📁 Creating logs directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs"
New-Item -ItemType Directory -Force -Path "logs\nginx"
New-Item -ItemType Directory -Force -Path "backups"

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Build application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Application built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build application: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Install PM2 globally
Write-Host "⚡ Installing PM2..." -ForegroundColor Yellow
try {
    npm install -g pm2
    npm install -g pm2-windows-service
    Write-Host "✅ PM2 installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install PM2: $($_.Exception.Message)" -ForegroundColor Red
}

# Setup PM2 Windows Service
Write-Host "🔄 Setting up PM2 Windows Service..." -ForegroundColor Yellow
try {
    pm2-service-install -n PM2Varsagel -f
    Write-Host "✅ PM2 Windows Service installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PM2 Windows Service might already be installed or failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Set environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Machine")
[Environment]::SetEnvironmentVariable("FORCE_VARSAGEL_DOMAIN", "true", "Machine")
[Environment]::SetEnvironmentVariable("PORT", "3000", "Machine")

# Create .env.production if it doesn't exist
if (-not (Test-Path ".env.production")) {
    Write-Host "📝 Creating .env.production file..." -ForegroundColor Yellow
    Copy-Item ".env.production.example" ".env.production"
    Write-Host "⚠️ Please edit .env.production with your actual configuration!" -ForegroundColor Yellow
}

# Setup Windows Firewall
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Yellow
try {
    # Check if rules already exist
    $existingRule = Get-NetFirewallRule -DisplayName "Varsagel-HTTP" -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName "Varsagel-HTTP" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any
        Write-Host "✅ Firewall rule for port 3000 created" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Firewall rule for port 3000 already exists" -ForegroundColor Blue
    }
} catch {
    Write-Host "⚠️ Failed to create firewall rule: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Install Windows performance counters (optional)
Write-Host "📊 Setting up performance monitoring..." -ForegroundColor Yellow
try {
    # Create performance counter if it doesn't exist
    if (-not (Get-Counter -ListSet "Varsagel" -ErrorAction SilentlyContinue)) {
        # This would require custom performance counters setup
        Write-Host "ℹ️ Performance counters setup skipped (requires manual configuration)" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ️ Performance monitoring setup skipped" -ForegroundColor Blue
}

# Create health check script
Write-Host "🏥 Creating health check script..." -ForegroundColor Yellow
$healthCheckScript = @'
# Health check script for Varsagel
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Varsagel is healthy" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ Varsagel health check failed: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Varsagel is not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
'@
$healthCheckScript | Out-File -FilePath "health-check.ps1" -Encoding UTF8

# Create backup script
Write-Host "💾 Creating backup script..." -ForegroundColor Yellow
$backupScript = @'
# Backup script for Varsagel
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups\$date"
New-Item -ItemType Directory -Force -Path $backupDir

# Backup logs
Copy-Item "logs" "$backupDir\logs" -Recurse -Force

# Backup database (if PostgreSQL is installed)
if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    pg_dump -h localhost -U varsagel_user varsagel | Out-File "$backupDir\database.sql"
}

# Create archive
Compress-Archive -Path $backupDir -DestinationPath "backups\backup_$date.zip"
Remove-Item $backupDir -Recurse -Force

Write-Host "✅ Backup created: backups\backup_$date.zip" -ForegroundColor Green
'@
$backupScript | Out-File -FilePath "backup.ps1" -Encoding UTF8

# Create start script
Write-Host "▶️ Creating start script..." -ForegroundColor Yellow
$startScript = @'
# Start Varsagel with PM2
pm2 start ecosystem.config.js --env production
Write-Host "✅ Varsagel started with PM2" -ForegroundColor Green
Write-Host "📊 Monitor with: pm2 monit" -ForegroundColor Blue
Write-Host "📋 View logs with: pm2 logs varsagel" -ForegroundColor Blue
Write-Host "🌐 Access at: http://localhost:3000" -ForegroundColor Blue
'@
$startScript | Out-File -FilePath "start-production.ps1" -Encoding UTF8

# Create stop script
Write-Host "⏹️ Creating stop script..." -ForegroundColor Yellow
$stopScript = @'
# Stop Varsagel
pm2 stop varsagel
Write-Host "✅ Varsagel stopped" -ForegroundColor Green
'@
$stopScript | Out-File -FilePath "stop-production.ps1" -Encoding UTF8

# Create restart script
Write-Host "🔄 Creating restart script..." -ForegroundColor Yellow
$restartScript = @'
# Restart Varsagel
pm2 restart varsagel
Write-Host "✅ Varsagel restarted" -ForegroundColor Green
'@
$restartScript | Out-File -FilePath "restart-production.ps1" -Encoding UTF8

# Final steps
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "" 
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.production with your actual configuration" -ForegroundColor White
Write-Host "2. Run 'powershell -ExecutionPolicy Bypass -File start-production.ps1' to start" -ForegroundColor White
Write-Host "3. Access your application at http://localhost:3000" -ForegroundColor White
Write-Host "4. Monitor with 'pm2 monit'" -ForegroundColor White
Write-Host "5. Check health with 'powershell -ExecutionPolicy Bypass -File health-check.ps1'" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "- WINDOWS_DEPLOYMENT_GUIDE.md for detailed Windows deployment" -ForegroundColor White
Write-Host "- DOCKER_DEPLOYMENT_GUIDE.md for Docker deployment (requires Docker Desktop)" -ForegroundColor White
Write-Host "- SECURITY_DEPLOYMENT_GUIDE.md for security configuration" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Management commands:" -ForegroundColor Yellow
Write-Host "- pm2 list (view all processes)" -ForegroundColor White
Write-Host "- pm2 logs varsagel (view logs)" -ForegroundColor White
Write-Host "- pm2 monit (monitoring dashboard)" -ForegroundColor White
Write-Host "- pm2 stop varsagel (stop application)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ Important:" -ForegroundColor Red
Write-Host "- Make sure to configure your .env.production file before starting!" -ForegroundColor Red
Write-Host "- Set up your database connection" -ForegroundColor Red
Write-Host "- Configure SSL/TLS certificates for production" -ForegroundColor Red