@echo off
rem install.bat - run install.ps1 from this folder and keep the window open.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
echo.
pause
