@echo off
cd /d "%~dp0"
echo Abrindo Shadowdark Item Builder v31 em http://127.0.0.1:8015/index.html?v=31
start "" "http://127.0.0.1:8015/index.html?v=31"
python -m http.server 8015
pause
