@echo off
cd /d "%~dp0"
echo Abrindo Shadowdark Item Builder v29 em http://127.0.0.1:8013/index.html?v=29
start "" "http://127.0.0.1:8013/index.html?v=29"
python -m http.server 8013
pause
