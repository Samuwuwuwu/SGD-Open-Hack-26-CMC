@echo off
echo Setting up project dependencies...

:: Install root dependencies
echo Installing root dependencies...
call npm install

:: Install Web App dependencies
echo Installing Web frontend dependencies...
cd apps\web
call npm install
cd ..\..

:: Install API dependencies (Including xlsx for inventory parsing)
echo Installing API dependencies...
cd services\api
call npm install xlsx
call npm install
cd ..\..

:: Install Python dependencies for data generation
echo Installing Python dependencies...
python -m pip install -r data\requirements.txt

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
