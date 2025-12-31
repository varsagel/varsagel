@echo off
echo Starting Chrome in Debug Mode...
echo Please close all running Chrome windows first!
echo.
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug-profile"
pause