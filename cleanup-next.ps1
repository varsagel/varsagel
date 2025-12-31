# Next.js kilit temizleme script'i
Write-Host "Next.js kilit temizleme başlatılıyor..."

# Node.js süreçlerini sonlandır
taskkill /F /IM node.exe 2>$null

# .next klasörünü tamamen temizle
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host ".next klasörü temizlendi"
}

# Kilit dosyasını kontrol et
if (Test-Path ".next\dev\lock") {
    Remove-Item -Force .next\dev\lock
    Write-Host "Kilit dosyası temizlendi"
}

Write-Host "Temizleme tamamlandı!"
Write-Host "Şimdi 'npm run dev' komutunu çalıştırabilirsiniz."