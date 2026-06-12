@echo off
cd /d "%~dp0"

echo Starting Wonder World 6 Quiz...
echo.
echo Keep this window open while using the quiz.
echo.

start "Wonder World Quiz Server" cmd.exe /k "npm.cmd run dev -- --host 0.0.0.0"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
