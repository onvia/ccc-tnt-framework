
# node ./dist/index.js
# exec /bin/bash
#!/bin/sh  

#============ get the file name ===========  

echo -e "i18n::拖拽想要处理的文件和文件夹到此"  

read InputDir  

echo "导出数据"  

node dist/index.js --format language-json --input "${InputDir}" --output ./out/language --dts 

exec /bin/bash