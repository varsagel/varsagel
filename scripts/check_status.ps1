Write-Host "Site Status Check" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green

# Check if server is running on port 3004
$port3004 = Get-NetTCPConnection -LocalPort 3004 -State Listen -ErrorAction SilentlyContinue
if ($port3004) {
    Write-Host "✓ Server running on port 3004" -ForegroundColor Green
} else {
    Write-Host "✗ Server not running on port 3004" -ForegroundColor Red
}

# Check if server is running on port 80
$port80 = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
if ($port80) {
    Write-Host "✓ Server running on port 80" -ForegroundColor Green
} else {
    Write-Host "✗ Server not running on port 80" -ForegroundColor Red
}

# Check if server is running on port 443
$port443 = Get-NetTCPConnection -LocalPort 443 -State Listen -ErrorAction SilentlyContinue
if ($port443) {
    Write-Host "✓ Server running on port 443" -ForegroundColor Green
} else {
    Write-Host "✗ Server not running on port 443" -ForegroundColor Red
}

Write-Host ""
Write-Host "Site URLs:" -ForegroundColor Yellow
Write-Host "Local: http://localhost:3004" -ForegroundColor Cyan
Write-Host "Production: https://www.varsagel.com" -ForegroundColor Cyan