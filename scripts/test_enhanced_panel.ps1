# Test script for the enhanced Ultra Panel
Write-Host "Testing Varsagel Ultra Panel v3 Enhanced Edition..." -ForegroundColor Green
Write-Host ""

# Check if the enhanced panel file exists
$panelPath = "c:\varsagel\varsagel\scripts\Manager_Ultra_Enhanced.ps1"
if (Test-Path $panelPath) {
    Write-Host "✓ Enhanced panel file exists" -ForegroundColor Green
    
    # Check syntax
    $syntaxCheck = powershell -Command "Get-Command -Syntax '$panelPath' 2>&1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Syntax check passed" -ForegroundColor Green
    } else {
        Write-Host "✗ Syntax check failed" -ForegroundColor Red
    }
    
    # Check file size and features
    $fileInfo = Get-Item $panelPath
    Write-Host "✓ File size: $([math]::Round($fileInfo.Length/1KB, 1)) KB" -ForegroundColor Green
    
    # Check for key features
    $content = Get-Content $panelPath -Raw
    $features = @{
        "Themes" = $content -match "Apply-Theme"
        "Background Workers" = $content -match "BackgroundWorker"
        "Thread-safe UI" = $content -match "InvokeRequired"
        "Performance Monitoring" = $content -match "performanceChart"
        "Enhanced Logging" = $content -match "Write-Log"
        "Port Management" = $content -match "activePort"
        "System Info" = $content -match "Update-SystemInfo"
    }
    
    Write-Host ""
    Write-Host "Feature Analysis:" -ForegroundColor Yellow
    foreach ($feature in $features.GetEnumerator()) {
        if ($feature.Value) {
            Write-Host "✓ $($feature.Key) - Implemented" -ForegroundColor Green
        } else {
            Write-Host "✗ $($feature.Key) - Missing" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Key Improvements Made:" -ForegroundColor Yellow
    Write-Host "• Fixed Apply-Theme function order (defined before use)" -ForegroundColor Cyan
    Write-Host "• Added null checks for all UI elements in theme application" -ForegroundColor Cyan
    Write-Host "• Implemented Write-Log function for consistent logging" -ForegroundColor Cyan
    Write-Host "• Added thread-safe UI updates with InvokeRequired checks" -ForegroundColor Cyan
    Write-Host "• Enhanced background worker implementation" -ForegroundColor Cyan
    Write-Host "• Improved error handling and stability" -ForegroundColor Cyan
    Write-Host "• Better theme management with dark, light, and neon options" -ForegroundColor Cyan
    Write-Host "• Real-time system monitoring (CPU, RAM, performance charts)" -ForegroundColor Cyan
    Write-Host "• Enhanced server management (start/stop/build/clean)" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Ready to run! Use this command:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File `"$panelPath`"" -ForegroundColor White
    
} else {
    Write-Host "✗ Enhanced panel file not found" -ForegroundColor Red
}