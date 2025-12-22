# Test Manager.ps1 script functionality
Write-Host "=== Manager.ps1 Test ===" -ForegroundColor Green

$scriptPath = "C:\varsagel\varsagel\scripts\Manager.ps1"

# Test if script exists
if (Test-Path $scriptPath) {
    Write-Host "✓ Manager.ps1 dosyası bulundu" -ForegroundColor Green
} else {
    Write-Host "✗ Manager.ps1 dosyası bulunamadı" -ForegroundColor Red
    exit 1
}

# Test syntax by parsing
Write-Host "Syntax kontrol ediliyor..." -ForegroundColor Yellow
try {
    $content = Get-Content $scriptPath -Raw
    $errors = $null
    $tokens = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$errors)
    
    if ($errors.Count -eq 0) {
        Write-Host "✓ Syntax doğru" -ForegroundColor Green
    } else {
        Write-Host "✗ Syntax hataları:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "  - $($_.Message)" -ForegroundColor Red }
    }
} catch {
    Write-Host "✗ Parse hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Test project root detection
Write-Host "Proje kök dizini kontrol ediliyor..." -ForegroundColor Yellow
$projectRoot = "C:\varsagel\varsagel"
if (Test-Path "$projectRoot\package.json") {
    Write-Host "✓ Proje kök dizini doğru" -ForegroundColor Green
} else {
    Write-Host "✗ Proje kök dizini bulunamadı" -ForegroundColor Red
}

# Test environment file
Write-Host "Environment dosyası kontrol ediliyor..." -ForegroundColor Yellow
$envFile = "$projectRoot\.env.production"
if (Test-Path $envFile) {
    Write-Host "✓ .env.production dosyası var" -ForegroundColor Green
} else {
    Write-Host "⚠ .env.production dosyası yok (isteğe bağlı)" -ForegroundColor Yellow
}

Write-Host "=== Test Tamamlandı ===" -ForegroundColor Green