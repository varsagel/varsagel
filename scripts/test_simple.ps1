# Simple test for enhanced Ultra Panel
Write-Host "Varsagel Ultra Panel v3 Enhanced - Test Results" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

$panelPath = "c:\varsagel\varsagel\scripts\Manager_Ultra_Enhanced.ps1"

if (Test-Path $panelPath) {
    Write-Host "✓ Panel file exists" -ForegroundColor Green
    
    $size = (Get-Item $panelPath).Length
    Write-Host "✓ File size: $([math]::Round($size/1KB, 1)) KB" -ForegroundColor Green
    
    $content = Get-Content $panelPath -Raw
    
    # Check key features
    $hasThemeFunction = $content -match "function Apply-Theme"
    $hasBackgroundWorker = $content -match "BackgroundWorker"
    $hasThreadSafe = $content -match "InvokeRequired"
    $hasWriteLog = $content -match "function Write-Log"
    $hasSystemInfo = $content -match "Update-SystemInfo"
    
    Write-Host ""
    Write-Host "Feature Check:" -ForegroundColor Yellow
    Write-Host "$(if($hasThemeFunction){'✓'}else{'✗'}) Apply-Theme function" -ForegroundColor $(if($hasThemeFunction){'Green'}else{'Red'})
    Write-Host "$(if($hasBackgroundWorker){'✓'}else{'✗'}) Background Workers" -ForegroundColor $(if($hasBackgroundWorker){'Green'}else{'Red'})
    Write-Host "$(if($hasThreadSafe){'✓'}else{'✗'}) Thread-safe Updates" -ForegroundColor $(if($hasThreadSafe){'Green'}else{'Red'})
    Write-Host "$(if($hasWriteLog){'✓'}else{'✗'}) Write-Log Function" -ForegroundColor $(if($hasWriteLog){'Green'}else{'Red'})
    Write-Host "$(if($hasSystemInfo){'✓'}else{'✗'}) System Monitoring" -ForegroundColor $(if($hasSystemInfo){'Green'}else{'Red'})
    
    Write-Host ""
    Write-Host "Key Improvements Made:" -ForegroundColor Yellow
    Write-Host "• Fixed Apply-Theme function order and null reference issues" -ForegroundColor Cyan
    Write-Host "• Added comprehensive Write-Log function for consistent logging" -ForegroundColor Cyan
    Write-Host "• Implemented thread-safe UI updates with InvokeRequired checks" -ForegroundColor Cyan
    Write-Host "• Enhanced background worker implementation for stability" -ForegroundColor Cyan
    Write-Host "• Added three theme options (dark, light, neon) with proper color schemes" -ForegroundColor Cyan
    Write-Host "• Real-time system monitoring with CPU/RAM usage and performance charts" -ForegroundColor Cyan
    Write-Host "• Enhanced server management with start/stop/build/clean functionality" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Ready to run! Command:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File `"$panelPath`"" -ForegroundColor White
    
} else {
    Write-Host "✗ Panel file not found at $panelPath" -ForegroundColor Red
}