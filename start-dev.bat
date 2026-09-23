@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul
title CMC DEV LAUNCHER

echo.
echo ============================================================
echo                    CMC DEV LAUNCHER
echo ============================================================
echo.

start "CMC API" /D "%~dp0services\api" cmd /k "color 0A && echo. && echo ========================================== && echo CMC API && echo ========================================== && echo. && call npm run dev:api"
start "CMC WEB" /D "%~dp0apps\web" cmd /k "color 0B && echo. && echo ========================================== && echo CMC WEB && echo ========================================== && echo. && call npm run dev:web -- --host 127.0.0.1 --port 5173"

echo [READY] API terminal opened:      http://localhost:3001
echo [READY] Frontend terminal opened: http://localhost:5173
echo [INFO] Press Ctrl+C in the CMC API and CMC WEB terminals to stop.
exit /b 0
