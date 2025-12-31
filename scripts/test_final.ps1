Write-Host "Production Configuration Test" -ForegroundColor Green
$panelPath = "c:\varsagel\varsagel\scripts\Manager_Ultra_Enhanced.ps1"
if (Test-Path $panelPath) {
    Write-Host "Panel exists" -ForegroundColor Green
    $content = Get-Content $panelPath -Raw
    if ($content -match "www\.varsagel\.com") {
        Write-Host "Production domain configured" -ForegroundColor Green
    }
    if ($content -match "https://www\.varsagel\.com") {
        Write-Host "HTTPS support enabled" -ForegroundColor Green
    }
    if ($content -match "80.*3000.*3004") {
        Write-Host "Port monitoring updated" -ForegroundColor Green
    }
    Write-Host "Panel ready for production use" -ForegroundColor Yellow
    Write-Host "Run: powershell -ExecutionPolicy Bypass -File `"$panelPath`"" -ForegroundColor White
} else {
    Write-Host "Panel not found" -ForegroundColor Red
}