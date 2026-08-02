@echo off
cd /d "%~dp0"
echo Abrindo Shadowdark Item Builder v30 em http://127.0.0.1:8014/index.html?v=30
start "" "http://127.0.0.1:8014/index.html?v=30"
python -m http.server 8014
pause
