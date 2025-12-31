@echo off
setlocal enableextensions enabledelayedexpansion
cd /d %~dp0

if not exist logs mkdir logs >nul 2>&1
set LOGFILE=%CD%\logs\start.log
echo ================================================ >> "%LOGFILE%"
echo [%date% %time%] Start sequence initiated >> "%LOGFILE%"

echo Checking Node and npm...
echo [%date% %time%] Checking Node and npm >> "%LOGFILE%"
where node >nul 2>&1 || (
  echo Node.js not found
  echo Node.js not found >> "%LOGFILE%"
  exit /b 1
)
where npm >nul 2>&1 || (
  echo npm not found
  echo npm not found >> "%LOGFILE%"
  exit /b 1
)

echo Firewall step...
echo [%date% %time%] Firewall step >> "%LOGFILE%"

if not exist node_modules (
  echo Installing dependencies...
  echo [%date% %time%] npm install >> "%LOGFILE%"
  call npm install --no-audit --no-fund 1>> "%LOGFILE%" 2>> "%LOGFILE%"
)

rem Check admin privileges (required for firewall rules)
net session >nul 2>&1
if %errorlevel%==0 (
  echo Opening firewall ports...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "if (!(Get-NetFirewallRule -DisplayName 'Allow Node HTTPS' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'Allow Node HTTPS' -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow }"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "if (!(Get-NetFirewallRule -DisplayName 'Allow HTTP' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'Allow HTTP' -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow }"
) else (
  echo Skipping firewall setup (run as Administrator to enable)
  echo [%date% %time%] Skipping firewall >> "%LOGFILE%"
)

set CERTCRT=%CD%\server.crt
set CERTKEY=%CD%\server.key

if not exist "%CERTCRT%" (
  echo Requesting certificate via ACME...
  echo [%date% %time%] ACME issue start >> "%LOGFILE%"
  node scripts\acme-issue.js || node scripts\generate-cert-v2.js
) else (
  for %%F in ("%CERTCRT%") do set CRTSIZE=%%~zF
  if "!CRTSIZE!"=="0" (
    echo Reissuing certificate...
    echo [%date% %time%] ACME reissue start >> "%LOGFILE%"
    node scripts\acme-issue.js || node scripts\generate-cert-v2.js
  )
)

echo Stopping previous node processes...
echo [%date% %time%] Killing node.exe >> "%LOGFILE%"
taskkill /F /IM node.exe >nul 2>&1

echo Syncing Database...
echo [%date% %time%] Prisma db push >> "%LOGFILE%"
call npx prisma db push

echo Building Next.js app...
set NODE_ENV=production
set NEXTAUTH_URL=https://www.varsagel.com
set NODE_OPTIONS=--max-old-space-size=4096
call npm run build

if exist ".next\BUILD_ID" (
  echo Build successful. Starting in PRODUCTION mode.
  set NODE_ENV=production
) else (
  echo Build artifacts missing or incomplete.
  echo Falling back to DEVELOPMENT mode.
  set NODE_ENV=development
)

if not exist logs mkdir logs >nul 2>&1
echo Starting HTTPS server in foreground (press Ctrl+C to stop)...
set NEXTAUTH_URL=https://www.varsagel.com
set AUTH_URL=https://www.varsagel.com
set AUTH_TRUST_HOST=true
echo Setting NEXTAUTH_URL to %NEXTAUTH_URL%
echo [%date% %time%] Starting server.js >> "%LOGFILE%"
node server.js
if errorlevel 1 (
  echo Server.js failed to start.
  echo Press any key to view logs...
  pause
  exit /b 1
)

rem If node exits, report status
echo Server stopped.
echo Press any key to exit...
pause
exit /b %errorlevel%
