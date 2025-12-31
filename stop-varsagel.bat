@echo off
setlocal enableextensions
cd /d %~dp0

echo Stopping Varsagel services...

echo Killing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Attempting to kill listeners on ports 80, 443 and 3004...
powershell -Command "foreach ($p in 80,443,3004) { $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; foreach ($c in $conns) { try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch {} } }"

echo Removing firewall rules (HTTP/HTTPS) if present...
powershell -Command "Get-NetFirewallRule -DisplayName 'Allow Node HTTPS' -ErrorAction SilentlyContinue | Remove-NetFirewallRule -Confirm:$false"
powershell -Command "Get-NetFirewallRule -DisplayName 'Allow HTTP' -ErrorAction SilentlyContinue | Remove-NetFirewallRule -Confirm:$false"

echo Checking remaining listeners...
netstat -ano | findstr LISTENING | findstr ":80"
netstat -ano | findstr LISTENING | findstr ":443"

echo Varsagel services stopped.
exit /b 0

