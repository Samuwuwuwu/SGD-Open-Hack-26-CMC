@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul
title ROLLOVER LOCAL VALIDATION
set "FAILED=0"

echo.
echo ============================================================
echo                ROLLOVER LOCAL VALIDATION
echo ============================================================
echo.
echo [CHECK] Lint
call npm run lint
if errorlevel 1 set "FAILED=1"
echo.
echo [CHECK] Tests
call npm test
if errorlevel 1 set "FAILED=1"
echo.
echo [CHECK] Frontend production build
call npm run build
if errorlevel 1 set "FAILED=1"

if "%FAILED%"=="1" (
  echo.
  echo [FAIL] One or more ROLLOVER checks failed.
  exit /b 1
)
echo.
echo [OK] Local ROLLOVER validation passed.
exit /b 0
