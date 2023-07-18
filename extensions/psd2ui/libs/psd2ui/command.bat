set input1=%1%
set input2=%2%
set input3=%3%
set input4=%4%
set input5=%5%
set input6=%6%
set input7=%7%
set input8=%8%
set input9=%9%

cd /d %~dp0

node ./index.js --engine-version v249 %input1% %input1% %input2% %input3% %input4% %input5% %input6% %input7% %input8% %input9%