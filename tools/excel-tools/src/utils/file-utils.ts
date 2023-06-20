
import fs from 'fs-extra';
import path from 'path';
import crypto from "crypto";


class FileUtils {

    // 深度遍历
    DFS(root: string, callback?: (options: {isDirectory: boolean,fullPath: string, fileName: string,depth: number}) => void,depth = 0) {
        let exists = fs.existsSync(root);
        if (!exists) {
            console.log(`FileUtils-> ${root} is not exists`);
            return;
        }
        let files = fs.readdirSync(root);
        let _cacheDepth = depth;
        depth ++;
        files.forEach((file) => {
            let fullPath = path.join(root, file);
            let stat = fs.lstatSync(fullPath);
            let isDirectory = stat.isDirectory();
            callback?.({isDirectory,fullPath,fileName: file,depth: _cacheDepth});
            if (!isDirectory) {
                
            } else {
                this.DFS(fullPath,callback,depth);
            }
        });
    }

    filterFile(root: string, filter?: (fileName: string) => boolean): string[] {
        let exists = fs.existsSync(root);
        if (!exists) {
            console.log(`FileUtils-> ${root} is not exists`);
            return;
        }
        var res: string[] = [];
        let files = fs.readdirSync(root);
        files.forEach((file) => {
            let pathName = path.join(root, file);
            let stat = fs.lstatSync(pathName);
            let isDirectory = stat.isDirectory();
            // 只对文件进行判断
            if(!isDirectory){
                let isPass = filter(file);
                if(!isPass){
                    return;
                }
            }
            if (!isDirectory) {
                res.push(pathName);
            } else {
                res = res.concat(this.filterFile(pathName,filter));
            }
        });
        return res
    }

    getFolderFiles(dir: string,type: "folder" | "file"){
        let exists = fs.existsSync(dir);
        if (!exists) {
            console.log(`FileUtils-> ${dir} is not exists`);
            return;
        }
        let res: {fullPath: string,basename: string}[] = [];
        let files = fs.readdirSync(dir);
        files.forEach((file) => {
            let fullPath = path.join(dir, file);
            let stat = fs.lstatSync(fullPath);
            let isDirectory = stat.isDirectory();
            if (isDirectory) {
                if(type === 'folder'){
                    res.push({fullPath,basename: file});
                }    
            }else{
                if(type === 'file'){
                    res.push({fullPath,basename: file});
                }    
            }
        });
        return res;
    }


    async writeJsonFile(fullPath: string, data: any) {
        if(typeof data !== 'string'){
            try {
                data = JSON.stringify(data,null,2);
            } catch (error) {
                console.log(`FileUtils->writeFile `,error);
                return;
            }
        }
     
        this.writeFile(fullPath,data);
    }

    async writeFile(fullPath: string, data: any){
        if(!data){
            console.log(`FileUtils-> ${fullPath} 文件内容不能为空`);
            return;
        }
        console.log(`写入文件 ${fullPath}`);
        
        let dir = path.dirname(fullPath);
        await fs.mkdirp(dir);
        await fs.writeFile(fullPath, data);
        
        console.log(`写入完成 ${fullPath} `);
    }

    /** 获取文件的 md5 */
    getMD5(buffer: Buffer | string){
        if(typeof buffer === 'string'){
             buffer = fs.readFileSync(buffer);
        }
        let md5 = crypto.createHash("md5").update(buffer).digest("hex");
        return md5;
    }
}

export let fileUtils = new FileUtils();