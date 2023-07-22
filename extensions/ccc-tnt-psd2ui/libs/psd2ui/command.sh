# exec /bin/bash
#!/bin/sh  

node_dir=$(dirname $(dirname $(dirname $(realpath $0))))

"${node_dir}"/bin/node ./index.js $1 $2

echo 请按任意键继续..
read -n 1