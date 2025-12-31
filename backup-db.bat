@echo off
setlocal enableextensions enabledelayedexpansion
cd /d %~dp0

if not exist backups mkdir backups

rem Get date in format YYYY-MM-DD
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
rem Fallback if date format varies
if "%mydate%"=="" set mydate=%date:~10,4%-%date:~4,2%-%date:~7,2%

set BACKUP_FILE=backups\prod-%mydate%.db
set DB_FILE=data\prod.db

echo Backing up %DB_FILE% to %BACKUP_FILE%...

if exist "%DB_FILE%" (
    copy "%DB_FILE%" "%BACKUP_FILE%" >nul
    if %errorlevel%==0 (
        echo Backup successful.
        
        rem Delete backups older than 7 days
        forfiles /p "backups" /s /m *.db /d -7 /c "cmd /c del @path" >nul 2>&1
    ) else (
        echo Backup failed!
    )
) else (
    echo Database file not found!
)
