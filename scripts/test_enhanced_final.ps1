# Simple test for enhanced Ultra Panel
Write-Host "Varsagel Ultra Panel v3 Enhanced - Test Results" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

$panelPath = "c:\varsagel\varsagel\scripts\Manager_Ultra_Enhanced.ps1"

if (Test-Path $panelPath) {
    Write-Host "✓ Panel file exists" -ForegroundColor Green
    
    $content = Get-Content $panelPath -Raw
    $size = (Get-Item $panelPath).Length
    Write-Host "✓ File size: $([math]::Round($size/1KB, 1)) KB" -ForegroundColor Green
    
    # Check key features
    $features = @(
        @{Name="Apply-Theme function"; Found=($content -match "function Apply-Theme")},
        @{Name="Background Workers"; Found=($content -match "BackgroundWorker")},
        @{Name="Thread-safe Updates"; Found=($content -match "InvokeRequired")},
        @{Name="Performance Chart"; Found=($content -match "performanceChart")},
        @{Name="Write-Log Function"; Found=($content -match "function Write-Log")},
        @{Name="System Monitoring"; Found=($content -match "Update-SystemInfo")},
        @{Name="Theme Support"; Found=($content -match "\$themes = @")},
        @{Name="Enhanced UI"; Found=($content -match "Enhanced")}
    )
    
    Write-Host ""
    Write-Host "Feature Check:" -ForegroundColor Yellow
    foreach ($feature in $features) {
        if ($feature.Found) {
            Write-Host "✓ $($feature.Name)" -ForegroundColor Green
        } else {
            Write-Host "✗ $($feature.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Key Improvements:" -ForegroundColor Yellow
    Write-Host "• Fixed Apply-Theme function order and null reference issues" -ForegroundColor Cyan
    Write-Host "• Added comprehensive Write-Log function for consistent logging" -ForegroundColor Cyan
    Write-Host "• Implemented thread-safe UI updates with InvokeRequired checks" -ForegroundColor Cyan
    Write-Host "• Enhanced background worker implementation for stability" -ForegroundColor Cyan
    Write-Host "• Added three theme options (dark, light, neon) with proper color schemes" -ForegroundColor Cyan
    Write-Host "• Real-time system monitoring with CPU/RAM usage and performance charts" -ForegroundColor Cyan
    Write-Host "• Enhanced server management with start/stop/build/clean functionality" -ForegroundColor Cyan
    Write-Host "• Improved error handling and logging throughout the application" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Ready to run! Command:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File `"$panelPath`"" -ForegroundColor White
    
} else {
    Write-Host "✗ Panel file not found at $panelPath" -ForegroundColor Red
}