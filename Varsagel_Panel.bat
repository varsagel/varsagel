@echo off
title Varsagel Gelistirme Paneli Baslatiliyor...
echo Varsagel Gelistirme Paneli yukleniyor, lutfen bekleyin...

cd /d "%~dp0"

:: Check if scripts folder exists
if not exist "scripts\Manager.ps1" (
    echo HATA: scripts\Manager.ps1 dosyasi bulunamadi!
    pause
    exit
)

set VARSAGEL_PANEL_MODE=staging
PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& 'scripts\Manager.ps1'"

if %errorlevel% neq 0 (
    echo Bir hata olustu.
    pause
)
