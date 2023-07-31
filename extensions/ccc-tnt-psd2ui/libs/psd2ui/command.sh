# exec /bin/bash
#!/bin/sh  

# node_dir=$(dirname $(dirname $(dirname $(realpath $0))))

cur_dir=$(dirname $0)
$(dirname $(dirname $cur_dir))/bin/node $cur_dir/index.js $1 $2

# echo 请按任意键继续..
# read -n 1