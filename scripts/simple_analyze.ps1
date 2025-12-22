# Site başlatma sorunu analizi
Write-Host "=== VARSAGEL SİTE ANALİZİ ===" -ForegroundColor Red

# Proje klasörü kontrolü
$projectRoot = "c:\varsagel\varsagel"
Write-Host "Proje klasörü: $projectRoot"
Write-Host "Klasör var mı: $(Test-Path $projectRoot)"

if (Test-Path $projectRoot) {
    Set-Location $projectRoot
    
    # package.json kontrolü
    $packageJson = "$projectRoot\package.json"
    Write-Host "package.json var mı: $(Test-Path $packageJson)"
    
    if (Test-Path $packageJson) {
        $packageContent = Get-Content $packageJson -Raw | ConvertFrom-Json
        Write-Host "Proje adı: $($packageContent.name)"
        Write-Host "Scripts: $($packageContent.scripts | ConvertTo-Json -Compress)"
    }
}

# Node.js kontrolü
Write-Host "Node.js versiyonu: $(node --version 2>$null)"
Write-Host "NPM versiyonu: $(npm --version 2>$null)"

# Port kontrolü
Write-Host "Port durumu:"
$ports = @(3000, 3004, 80, 443)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Port $port DOLU" -ForegroundColor Red
    } else {
        Write-Host "Port $port BOS" -ForegroundColor Green
    }
}

# Environment dosyaları
Write-Host "Environment dosyaları:"
$envFiles = @(".env", ".env.local", ".env.production")
foreach ($envFile in $envFiles) {
    $envPath = "$projectRoot\$envFile"
    Write-Host "$envFile var mı: $(Test-Path $envPath)"
}

# node_modules kontrolü
$nodeModules = "$projectRoot\node_modules"
Write-Host "node_modules var mı: $(Test-Path $nodeModules)"

Write-Host ""
Write-Host "=== ÇÖZÜM ÖNERİLERİ ===" -ForegroundColor Yellow
Write-Host "1. npm install (bağımlılıkları yükle)" -ForegroundColor Cyan
Write-Host "2. npm run dev (development server başlat)" -ForegroundColor Cyan
Write-Host "3. npm run start (production server başlat)" -ForegroundColor Cyan