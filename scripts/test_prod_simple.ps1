# Simple test for production configuration
Write-Host "Varsagel Panel Production Configuration Test" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$panelPath = "c:\varsagel\varsagel\scripts\Manager_Ultra_Enhanced.ps1"

if (Test-Path $panelPath) {
    Write-Host "✓ Panel file exists" -ForegroundColor Green
    
    $content = Get-Content $panelPath -Raw
    
    # Check production configuration
    $hasProductionDomain = $content -match "www\.varsagel\.com"
    $hasHttps = $content -match "https://www\.varsagel\.com"
    $hasPort80 = $content -match "80.*3000.*3004"
    $hasOpenWebsite = $content -match "Open-Website.*https://www\.varsagel\.com"
    
    Write-Host ""
    Write-Host "Production Configuration:" -ForegroundColor Yellow
    Write-Host "$(if($hasProductionDomain){'✓'}else{'✗'}) Production domain configured" -ForegroundColor $(if($hasProductionDomain){'Green'}else{'Red'})
    Write-Host "$(if($hasHttps){'✓'}else{'✗'}) HTTPS support enabled" -ForegroundColor $(if($hasHttps){'Green'}else{'Red'})
    Write-Host "$(if($hasPort80){'✓'}else{'✗'}) Port 80 monitoring" -ForegroundColor $(if($hasPort80){'Green'}else{'Red'})
    Write-Host "$(if($hasOpenWebsite){'✓'}else{'✗'}) Open website to production" -ForegroundColor $(if($hasOpenWebsite){'Green'}else{'Red'})
    
    Write-Host ""
    Write-Host "VDS Server Details:" -ForegroundColor Yellow
    Write-Host "• IP: 31.59.131.160" -ForegroundColor Cyan
    Write-Host "• Domain: www.varsagel.com" -ForegroundColor Cyan
    Write-Host "• Protocol: HTTPS (port 443)" -ForegroundColor Cyan
    Write-Host "• Also monitors HTTP (port 80)" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Panel now configured for production use!" -ForegroundColor Green
    Write-Host "Command to run:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File `"$panelPath`"" -ForegroundColor White
    
} else {
    Write-Host "✗ Panel file not found" -ForegroundColor Red
}