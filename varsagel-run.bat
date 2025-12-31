@echo off
setlocal

IF NOT EXIST "package.json" (
  echo Bu script projelerin kok dizininden calistirilmalidir.
  pause
  exit /b 1
)

IF NOT EXIST "node_modules" (
  echo Gerekli bagimliliklar yukleniyor...
  npm install
  IF ERRORLEVEL 1 (
    echo npm install basarisiz oldu.
    pause
    exit /b 1
  )
)

IF "%1"=="dev" (
  npm run dev
  exit /b %ERRORLEVEL%
)

IF "%1"=="build" (
  npm run build
  exit /b %ERRORLEVEL%
)

IF "%1"=="start" (
  npm run start
  exit /b %ERRORLEVEL%
)

npm run dev
exit /b %ERRORLEVEL%

