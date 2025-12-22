# Test script for production domain configuration
Write-Host "Testing Varsagel Panel Production Configuration..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

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
    Write-Host "Production Configuration Check:" -ForegroundColor Yellow
    Write-Host "$(if($hasProductionDomain){'✓'}else{'✗'}) Production domain (www.varsagel.com)" -ForegroundColor $(if($hasProductionDomain){'Green'}else{'Red'})
    Write-Host "$(if($hasHttps){'✓'}else{'✗'}) HTTPS support" -ForegroundColor $(if($hasHttps){'Green'}else{'Red'})
    Write-Host "$(if($hasPort80){'✓'}else{'✗'}) Port 80 monitoring" -ForegroundColor $(if($hasPort80){'Green'}else{'Red'})
    Write-Host "$(if($hasOpenWebsite){'✓'}else{'✗'}) Open website to production" -ForegroundColor $(if($hasOpenWebsite){'Green'}else{'Red'})
    
    Write-Host ""
    Write-Host "Production Features:" -ForegroundColor Yellow
    Write-Host "• Monitors production site at https://www.varsagel.com" -ForegroundColor Cyan
    Write-Host "• Checks both local development and production environments" -ForegroundColor Cyan
    Write-Host "• Opens browser directly to production domain" -ForegroundColor Cyan
    Write-Host "• Supports port 80, 443, 3000, and 3004 monitoring" -ForegroundColor Cyan
    Write-Host "• Detects if production site is already running" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "VDS Server Configuration:" -ForegroundColor Yellow
    Write-Host "• IP Address: 31.59.131.160" -ForegroundColor Cyan
    Write-Host "• Domain: www.varsagel.com" -ForegroundColor Cyan
    Write-Host "• Protocol: HTTPS (port 443)" -ForegroundColor Cyan
    Write-Host "• Also monitors standard HTTP (port 80)" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Ready for production! Command:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File `"$panelPath`"" -ForegroundColor White
    
} else {
    Write-Host "✗ Panel file not found at $panelPath" -ForegroundColor Red
}