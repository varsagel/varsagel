@echo off
title Varsagel Yonetim Paneli Baslatiliyor...
echo Varsagel Yonetim Paneli yukleniyor, lutfen bekleyin...

cd /d "%~dp0"

:: Check if scripts folder exists
if not exist "scripts\Manager.ps1" (
    echo HATA: scripts\Manager.ps1 dosyasi bulunamadi!
    pause
    exit
)

:: Run the PowerShell script with Bypass policy to avoid permission issues
PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& 'scripts\Manager.ps1'"

if %errorlevel% neq 0 (
    echo Bir hata olustu.
    pause
)
