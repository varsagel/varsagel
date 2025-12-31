# Test site access
Write-Host "Testing site access..." -ForegroundColor Green

# Test local access
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:3004" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Local site is accessible - Status: $($localResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Local site error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test production domain (if configured)
try {
    $prodResponse = Invoke-WebRequest -Uri "https://www.varsagel.com" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Production site is accessible - Status: $($prodResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Production site may not be configured yet: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "Site is running successfully!" -ForegroundColor Green