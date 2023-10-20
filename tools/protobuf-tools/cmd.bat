@echo off
echo protobuf-tools:: Drag and drop a file or folder
set /p var=
node ./dist/index.js --input %var% --outts ./out/ --outdts ./out/
pause
