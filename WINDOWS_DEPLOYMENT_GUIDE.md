# 🪟 Windows Deployment Guide for Varsagel

## Docker Kurulumu (Windows)

### Prerequisites
- Windows 10/11 Pro, Enterprise, or Education
- WSL2 (Windows Subsystem for Linux) enabled
- Virtualization enabled in BIOS

### Docker Desktop Kurulumu
1. **Docker Desktop'ı indirin:**
   https://www.docker.com/products/docker-desktop/

2. **Kurulum:**
   - Docker Desktop installer'ı çalıştırın
   - WSL2 bileşenlerini kurun
   - Bilgisayarı yeniden başlatın

3. **Doğrulama:**
```powershell
# PowerShell'de çalıştırın
docker --version
docker-compose --version
```

### Docker Kurulum Sonrası Build & Run
```powershell
# Varsagel klasörüne gidin
cd C:\varsagel\varsagel

# Docker image build et
 docker build -t varsagel:latest .

# Container çalıştır
 docker run -d -p 3000:3000 --env-file .env.production varsagel:latest
```

## Docker Alternatifi: PM2 ile Windows Production

### PM2 Kurulumu
```powershell
# PM2'yi global yükle
npm install -g pm2

# PM2 Windows service olarak kur
npm install -g pm2-windows-service

# PM2 Windows servisini kur
pm2-service-install

# Servisi başlat
Start-Service PM2
```

### Production Deploy with PM2
```powershell
# Uygulamayı production modunda başlat
pm2 start ecosystem.config.js --env production

# PM2'yi Windows başlangıcında otomatik başlat
pm2 startup
pm2 save
```

### PM2 Windows Management
```powershell
# Tüm process'leri listele
pm2 list

# Monitor modu
pm2 monit

# Logları görüntüle
pm2 logs varsagel

# Process durumu
pm2 info varsagel

# Yeniden başlat
pm2 restart varsagel

# Durdur
pm2 stop varsagel

# Sil
pm2 delete varsagel
```

## Windows IIS (Internet Information Services) Deployment

### IIS Kurulumu
1. **Windows Features'dan IIS'i etkinleştir:**
   - Control Panel → Programs → Turn Windows features on or off
   - Internet Information Services → World Wide Web Services → Application Development Features
   - ASP.NET 4.7 (veya en güncel versiyon)
   - WebSocket Protocol

2. **URL Rewrite modülünü yükle:**
   https://www.iis.net/downloads/microsoft/url-rewrite

3. **ARR (Application Request Routing) yükle:**
   https://www.iis.net/downloads/microsoft/application-request-routing

### IIS Node.js Integration
```powershell
# IISNode'u yükle
# Download from: https://github.com/Azure/iisnode/releases
msiexec /i iisnode-full-v0.2.21-x64.msi

# Node.js'yi IIS için yapılandır
%programfiles%\iisnode\setupsamples.bat
```

### IIS Web.config
Create `web.config` in project root:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode watchedFiles="web.config;*.js;routes/*.js;views/*.jsx" />
  </system.webServer>
</configuration>
```

## Windows Service with NSSM

### NSSM (Non-Sucking Service Manager) Kurulumu
1. **NSSM'yi indir:** https://nssm.cc/download
2. **NSSM'yi PATH'e ekle**

### Windows Service Oluşturma
```powershell
# NSSM ile Windows service oluştur
nssm install VarsagelService "C:\Program Files\nodejs\node.exe" "C:\varsagel\varsagel\server.js"

# Service description ekle
nssm description VarsagelService "Varsagel Web Application"

# Environment variables ayarla
nssm set VarsagelService AppEnvironmentExtra NODE_ENV=production
nssm set VarsagelService AppEnvironmentExtra PORT=3000

# Working directory ayarla
nssm set VarsagelService AppDirectory C:\varsagel\varsagel

# Service'i başlat
Start-Service VarsagelService

# Servis durumunu kontrol et
Get-Service VarsagelService
```

## Windows Firewall Configuration

### Firewall Rules Ekleme
```powershell
# Port 3000 için inbound rule ekle
New-NetFirewallRule -DisplayName "Varsagel-HTTP" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# Port 80 için inbound rule (if using IIS)
New-NetFirewallRule -DisplayName "Varsagel-IIS-HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Port 443 için inbound rule (HTTPS)
New-NetFirewallRule -DisplayName "Varsagel-HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

## Environment Variables (Windows)

### System Environment Variables
```powershell
# System-wide environment variables ekle
[Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Machine")
[Environment]::SetEnvironmentVariable("PORT", "3000", "Machine")
[Environment]::SetEnvironmentVariable("DATABASE_URL", "your-database-url", "Machine")
[Environment]::SetEnvironmentVariable("AUTH_SECRET", "your-auth-secret", "Machine")

# Değişiklikleri uygula
$env:NODE_ENV = [Environment]::GetEnvironmentVariable("NODE_ENV", "Machine")
```

### PowerShell Script for Setup
Create `setup-windows.ps1`:
```powershell
# Windows setup script for Varsagel
Write-Host "Setting up Varsagel on Windows..."

# Create logs directory
New-Item -ItemType Directory -Force -Path "logs"

# Install global dependencies
npm install -g pm2
npm install -g pm2-windows-service

# Install PM2 Windows service
pm2-service-install -n PM2

# Set environment variables
[Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Machine")
[Environment]::SetEnvironmentVariable("FORCE_VARSAGEL_DOMAIN", "true", "Machine")

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

Write-Host "Setup complete! Application is running on http://localhost:3000"
```

## Performance Optimization (Windows)

### Windows Performance Settings
```powershell
# Windows Defender exclusions (if needed)
Add-MpPreference -ExclusionPath "C:\varsagel\varsagel"
Add-MpPreference -ExclusionProcess "node.exe"

# Power plan ayarla (High Performance)
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Windows Update'ları zamanla
sc config wuauserv start= delayed-auto
```

### Node.js Optimization
```powershell
# Node.js memory limit artır
$env:NODE_OPTIONS="--max-old-space-size=4096"

# PM2 cluster mode ayarları
pm2 start ecosystem.config.js --env production --max-memory-restart 1G
```

## Monitoring (Windows)

### Windows Performance Monitor
```powershell
# Performance Monitor'da Node.js counter'ları ekle
logman create counter NodeJS_Performance -c "\Node.js(*)\*" -si 30 -f bin -o "C:\logs\nodejs_performance.blg"
logman start NodeJS_Performance
```

### Event Viewer Integration
```powershell
# Application logs'u Event Viewer'da görüntüle
Get-EventLog -LogName Application -Source "Varsagel" -Newest 50
```

## Troubleshooting (Windows)

### Common Issues

1. **Port Already in Use**
```powershell
# Port 3000'u kullanan process'i bul
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Process'i durdur
Stop-Process -Id <PID> -Force
```

2. **Permission Issues**
```powershell
# Klasör permission'ları ayarla
icacls "C:\varsagel\varsagel" /grant Everyone:F /T

# Execution policy ayarla
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

3. **Service Won't Start**
```powershell
# Event logs'u kontrol et
Get-EventLog -LogName System -Source "Service Control Manager" -Newest 20

# PM2 logs'u kontrol et
pm2 logs --lines 100
```

### Health Check Script
Create `health-check.ps1`:
```powershell
# Health check script
$healthUrl = "http://localhost:3000/api/health"

try {
    $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application is healthy" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ Application health check failed: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Application is not responding: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
```

## Security (Windows)

### Windows Security Hardening
```powershell
# Windows Firewall'u etkinleştir
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Specific firewall rules for Varsagel
New-NetFirewallRule -DisplayName "Varsagel-App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any

# Windows Defender'ı yapılandır
Set-MpPreference -DisableRealtimeMonitoring $false
```

### SSL/TLS with IIS
```powershell
# SSL certificate import
Import-PfxCertificate -FilePath "C:\certs\varsagel.pfx" -CertStoreLocation "Cert:\LocalMachine\My"

# IIS'de HTTPS binding ekle
Import-Module WebAdministration
New-WebBinding -Name "Varsagel" -Protocol "https" -Port 443 -IPAddress "*" -SslFlags 1
```

## Support

For Windows-specific issues:
- Check Event Viewer → Windows Logs → Application
- Review PM2 logs: `pm2 logs varsagel`
- Check Windows services: `Get-Service | Where-Object {$_.Name -like "*varsagel*"}`
- Monitor performance: `Get-Counter "\Processor(_Total)\% Processor Time"`