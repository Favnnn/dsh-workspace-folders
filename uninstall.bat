@echo off
rem uninstall.bat - run uninstall.ps1 from this folder and keep the window open.
rem Add PURGE to also delete the saved folder tree: uninstall.bat PURGE
if /I "%~1"=="PURGE" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1" -PurgeData
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
)
echo.
pause
