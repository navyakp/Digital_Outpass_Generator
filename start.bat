@echo off
echo Starting backend server...
start "Backend Server" cmd /k "node server/index.js"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo ============================================
echo Backend server running in a new window
echo Frontend running in a new window
echo ============================================
echo.
echo Close the new windows to stop the servers.
pause
