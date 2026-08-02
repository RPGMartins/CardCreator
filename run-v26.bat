@echo off
chcp 65001 > nul
cd /d "%~dp0"
set PORT=8010

echo ======================================================
echo Shadowdark Item Builder v26
echo Pasta servida:
echo %cd%
echo.
echo Abrindo em:
echo http://127.0.0.1:%PORT%/index.html?v=26
echo ======================================================
echo.
start "" "http://127.0.0.1:%PORT%/index.html?v=26"
python -m http.server %PORT% --bind 127.0.0.1
pause
