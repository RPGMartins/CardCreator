@echo off
cd /d "%~dp0"
echo Abrindo Shadowdark Item Builder v28 em http://127.0.0.1:8012/index.html?v=28
start "" "http://127.0.0.1:8012/index.html?v=28"
python -m http.server 8012
pause
