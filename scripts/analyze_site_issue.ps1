# Derinlemesine site başlatma sorunu analizi
Write-Host "=== VARSAGEL SİTE BAŞLATMA SORUNU ANALİZİ ===" -ForegroundColor Red
Write-Host ""

# 1. Proje klasörü kontrolü
Write-Host "1. PROJE KLASÖRÜ KONTROLÜ:" -ForegroundColor Yellow
$projectRoot = "c:\varsagel\varsagel"
Write-Host "Proje klasörü: $projectRoot"
Write-Host "Klasör var mı: $(Test-Path $projectRoot)"

if (Test-Path $projectRoot) {
    Set-Location $projectRoot
    Write-Host "Mevcut dizin: $(Get-Location)"
    
    # package.json kontrolü
    $packageJson = "$projectRoot\package.json"
    Write-Host "package.json var mı: $(Test-Path $packageJson)"
    
    if (Test-Path $packageJson) {
        $packageContent = Get-Content $packageJson -Raw | ConvertFrom-Json
        Write-Host "Proje adı: $($packageContent.name)"
        Write-Host "Scripts: $($packageContent.scripts | ConvertTo-Json -Compress)"
    }
}

Write-Host ""

# 2. NODE.JS VE NPM KONTROLÜ
Write-Host "2. NODE.JS VE NPM KONTROLÜ:" -ForegroundColor Yellow
Write-Host "Node.js versiyonu: $(node --version 2>$null)"
Write-Host "NPM versiyonu: $(npm --version 2>$null)"

# 3. BAĞIMLILIKLAR KONTROLÜ
Write-Host ""
Write-Host "3. BAĞIMLILIKLAR KONTROLÜ:" -ForegroundColor Yellow
$nodeModules = "$projectRoot\node_modules"
Write-Host "node_modules var mı: $(Test-Path $nodeModules)"

if (Test-Path $nodeModules) {
    $modules = Get-ChildItem $nodeModules -Directory | Select-Object -First 5
    Write-Host "İlk 5 modül: $($modules.Name -join ', ')"
}

# 4. PORT DURUMU KONTROLÜ
Write-Host ""
Write-Host "4. PORT DURUMU KONTROLÜ:" -ForegroundColor Yellow
$ports = @(3000, 3004, 80, 443)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Port $port: DOLU" -ForegroundColor Red
        $connections | ForEach-Object { Write-Host "  - Process: $($_.OwningProcess)" }
    } else {
        Write-Host "Port $port: BOŞ" -ForegroundColor Green
    }
}

# 5. ENVIRONMENT DOSYALARI
Write-Host ""
Write-Host "5. ENVIRONMENT DOSYALARI:" -ForegroundColor Yellow
$envFiles = @(".env", ".env.local", ".env.production")
foreach ($envFile in $envFiles) {
    $envPath = "$projectRoot\$envFile"
    Write-Host "$envFile var mı: $(Test-Path $envPath)"
    if (Test-Path $envPath) {
        Write-Host "  İçerik:"
        Get-Content $envPath | ForEach-Object { Write-Host "    $_" }
    }
}

# 6. LOG DOSYALARI
Write-Host ""
Write-Host "6. LOG DOSYALARI:" -ForegroundColor Yellow
$logDir = "$projectRoot\logs"
if (Test-Path $logDir) {
    $logs = Get-ChildItem $logDir -File | Sort-Object LastWriteTime -Descending | Select-Object -First 3
    foreach ($log in $logs) {
        Write-Host "Log: $($log.Name) ($(Get-Date $log.LastWriteTime -Format 'yyyy-MM-dd HH:mm:ss'))"
        $content = Get-Content $log.FullName -Tail 3
        $content | ForEach-Object { Write-Host "  $_" }
    }
}

Write-Host ""
Write-Host "=== ANALİZ TAMAMLANDI ===" -ForegroundColor Red
Write-Host ""
Write-Host "OLASI SORUNLAR VE ÇÖZÜMLERİ:" -ForegroundColor Yellow
Write-Host "1. node_modules eksikse: npm install" -ForegroundColor Cyan
Write-Host "2. Port doluysa: Başka bir port kullan veya mevcut süreci durdur" -ForegroundColor Cyan
Write-Host "3. .env dosyası eksikse: PORT=3004 gibi ayarlar ekle" -ForegroundColor Cyan
Write-Host "4. Package.json eksikse: Proje kurulumu gerekli" -ForegroundColor Cyan