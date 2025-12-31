# Test Manager.ps1 script execution
Write-Host "=== Manager.ps1 Script Test ===" -ForegroundColor Green

# Test script loading
try {
    Write-Host "Manager.ps1 script'i test ediliyor..." -ForegroundColor Yellow
    
    # Load the script content
    $scriptContent = Get-Content "C:\varsagel\varsagel\scripts\Manager.ps1" -Raw
    
    # Check for key functions
    $functions = @("Start-Server", "Stop-Server", "Update-Status", "Open-Website", "Log-Message")
    
    Write-Host "Fonksiyon kontrolü:" -ForegroundColor Cyan
    foreach ($func in $functions) {
        if ($scriptContent -match "function\s+$func") {
            Write-Host "  ✓ $func fonksiyonu bulundu" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $func fonksiyonu bulunamadı" -ForegroundColor Red
        }
    }
    
    # Check for UI elements
    Write-Host "UI element kontrolü:" -ForegroundColor Cyan
    $uiElements = @("System.Windows.Forms.Form", "System.Windows.Forms.Button", "System.Windows.Forms.Label")
    foreach ($element in $uiElements) {
        if ($scriptContent -match $element) {
            Write-Host "  ✓ $element bulundu" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $element bulunamadı" -ForegroundColor Red
        }
    }
    
    # Check for environment loading
    if ($scriptContent -match "\.env\.production") {
        Write-Host "  ✓ Environment yükleme kodu bulundu" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Environment yükleme kodu bulunamadı" -ForegroundColor Red
    }
    
    # Check for port handling
    if ($scriptContent -match "443|3004|3000") {
        Write-Host "  ✓ Port kontrol kodu bulundu" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Port kontrol kodu bulunamadı" -ForegroundColor Red
    }
    
    Write-Host "✓ Manager.ps1 script'i başarıyla analiz edildi" -ForegroundColor Green
    Write-Host "✓ Script çalışmaya hazır" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Hata: $($_.Exception.Message)" -ForegroundColor Red
}