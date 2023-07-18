@echo off
echo excel2json:: Drag and drop a file or folder
set /p var=
node ./dist/index.js --input %var% --output ./out/ --dts
pause
