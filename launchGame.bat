@echo off

:: Kill anything using port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F
)

:: Start your server and Electron app
start "" cmd /c "node server.js"
start "" cmd /c "npx electron main.js"
