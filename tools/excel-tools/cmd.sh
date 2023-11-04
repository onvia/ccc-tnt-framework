
# node ./dist/index.js
# exec /bin/bash
#!/bin/sh  

#============ get the file name ===========  

echo -e "导出表格数据：拖拽想要处理的文件和文件夹到此"  

read InputDir  

echo "导出数据"  

node ./dist/index.js --input "${InputDir}" --output ./out/ --dts 

exec /bin/bash