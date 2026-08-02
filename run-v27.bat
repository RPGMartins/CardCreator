@echo off
cd /d "%~dp0"
echo Abrindo Shadowdark Item Builder v27 em http://127.0.0.1:8011/index.html?v=27
start "" "http://127.0.0.1:8011/index.html?v=27"
python -m http.server 8011
pause
