# Site başlatma testi
Write-Host "=== VARSAGEL SİTE BAŞLATMA TESTİ ===" -ForegroundColor Green

# Local test
Write-Host "Local site test:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ Local site çalışıyor - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Local site hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Production domain test
Write-Host ""
Write-Host "Production domain test:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://www.varsagel.com" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✓ Production site çalışıyor - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Production site hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Port kontrolü
Write-Host ""
Write-Host "Port durumu:" -ForegroundColor Yellow
$ports = @(3004, 80, 443)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "✓ Port $port: AKTİF" -ForegroundColor Green
    } else {
        Write-Host "✗ Port $port: PASİF" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== SONUÇ ===" -ForegroundColor Green
Write-Host "Site başarıyla başlatıldı!" -ForegroundColor Green
Write-Host "Local: http://localhost:3004" -ForegroundColor Cyan
Write-Host "Production: https://www.varsagel.com" -ForegroundColor Cyan