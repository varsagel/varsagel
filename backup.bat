@echo off
echo Varsagel Yedekleme Baslatiliyor...
powershell -ExecutionPolicy Bypass -File "./scripts/backup-to-github.ps1"
pause
