@echo off

set input1=%1%
set input2=%2%

cd /d %~dp0

%~dp0../../bin/node.exe ./index.js %input1% %input2%

pause
exit