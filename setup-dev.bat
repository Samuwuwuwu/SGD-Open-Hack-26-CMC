@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul
title CMC DEV SETUP

echo.
echo ============================================================
echo                    CMC DEV SETUP
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [FAIL] Node.js is required. Install Node.js 22 or newer and retry.
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [FAIL] npm is required. Install Node.js 22 or newer and retry.
  exit /b 1
)
node -e "const major = Number(process.versions.node.split('.')[0]); if (major < 22) process.exit(1)"
if errorlevel 1 (
  echo [FAIL] Node.js 22 or newer is required. Detected:
  node --version
  exit /b 1
)
echo [OK] Node.js and npm are available

if not exist "node_modules\react\package.json" goto install_dependencies
if not exist "node_modules\express\package.json" goto install_dependencies
if not exist "node_modules\vite\package.json" goto install_dependencies
echo [OK] Workspace dependencies already exist; reusing them.
echo [INFO] Stop the dev terminals before reinstalling dependencies.
goto dependencies_ready

:install_dependencies
if exist "package-lock.json" (
  echo [STEP] Installing dependencies from package-lock.json
  call npm ci
) else (
  echo [STEP] Creating package-lock.json and installing dependencies
  call npm install
)
if errorlevel 1 (
  echo [FAIL] npm dependency installation failed.
  exit /b 1
)

:dependencies_ready

if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
  if errorlevel 1 (
    echo [FAIL] Could not create .env from .env.example.
    exit /b 1
  )
  echo [OK] Created .env from .env.example
) else (
  echo [OK] .env already exists
)

echo.
echo [OK] CMC development setup is complete.
echo [NEXT] Run npm run dev to launch the frontend and API.
exit /b 0
