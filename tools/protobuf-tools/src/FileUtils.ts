
import fs from 'fs-extra';
import path from 'path';
class FileUtils {

    checkoutFiles(item: string, arr: string[]) {

        let itemStat = fs.statSync(item);
        if(itemStat.isFile()){
            arr.push(item);
            return;
        }

        let q = fs.readdirSync(item); //readdirSync 同步读取文件
        for (let i = 0; i < q.length; i++) {
            let item1 = path.join(item, q[i])
            let stat = fs.statSync(item1); //fs.statSync()方法获取路径的详细信息
            if (stat.isDirectory()) { // isDirectory() 检查是否为文件夹
                this.checkoutFiles(item1, arr)
            } else {
                console.log(item1);
                arr.push(item1);
            }
        }
    }
    private static _instance: FileUtils = null
    public static getInstance(): FileUtils {
        if (!this._instance) {
            this._instance = new FileUtils();
        }
        return this._instance;
    }
}

export const fileUtils = FileUtils.getInstance();