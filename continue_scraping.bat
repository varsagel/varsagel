@echo off
title Sahibinden Scraper Bot Loop
color 0A

:loop
echo.
echo ========================================================
echo 🚀 Scraper Bot Baslatiliyor... (Zaman: %TIME%)
echo ========================================================
echo.

node scripts/scrape-other-vehicles.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Islem BASARIYLA tamamlandi veya normal sekilde durduruldu.
    echo ⏹️ Dongu sonlandiriliyor.
    pause
    exit
) else (
    echo.
    echo ❌ Bir hata olustu veya baglanti koptu (Hata Kodu: %ERRORLEVEL%).
    echo 🔄 10 saniye icinde otomatik olarak yeniden baslatilacak...
    echo.
    timeout /t 10
    goto loop
)
