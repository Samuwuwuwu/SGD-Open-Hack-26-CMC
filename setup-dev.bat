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

echo Setup complete! Run start-dev.bat to launch the dev servers.
pause