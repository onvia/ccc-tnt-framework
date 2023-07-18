@echo off
echo i18n::Drag and drop a file or folder
set /p var=
node dist/index.js --format language-json --input %var% --output ./out/language --dts
pause
