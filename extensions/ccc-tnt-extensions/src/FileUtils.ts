
import fs from 'fs-extra';
import path from 'path';
import { extname, join, parse } from 'path';
import { AssetInfo } from '../@types/packages/asset-db/@types/public';

const AssetDir = `${Editor.Project.path}/assets`;
class FileUtils {

    getAllFiles(root: string, filter?: (isDirectory: boolean, fileName: string) => boolean) {
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
            let isPass = filter(isDirectory, file);
            if(!isPass){
                return;
            }
            if (!isDirectory) {
                res.push(pathName);
            } else {
                res = res.concat(this.getAllFiles(pathName,filter));
            }
        });
        return res
    }


    async writeFile(fullPath: string, data: any) {
        if(typeof data !== 'string'){
            try {
                data = JSON.stringify(data,null,4);
            } catch (error) {
                console.log(`FileUtils->writeFile `,error);
                return;
            }
        }
        console.log(`写入文件 ${fullPath}`);
        
        let dir = path.dirname(fullPath);
        await fs.mkdirp(dir);
        await fs.writeFile(fullPath, data);
        
        console.log(`写入完成 ${fullPath} `);
    }

    /**
     * 查询类
     *
     * @param {string} baseClass 基类，如果填写，则查询到的是 他的所有子类
     * @return {*} 
     * @memberof FileUtils
     */
    async queryClass(baseClass?: string){
        // 查询所有 继承自 UIBase 的类
        let _queryClassesRes: {name: string} [] = await Editor.Message.request("scene","query-classes",{extends: baseClass});

        // 查询所有 bundle
        let _queryBundlesRes: AssetInfo[] = await Editor.Message.request("asset-db","query-assets",{ isBundle: true, });

        
        
        // 查询类的全路径
        let scripts: string[] = fileUtils.getAllFiles(AssetDir, (isDirectory,file) => {
            if(isDirectory){
                return true;
            }
            let _extname = extname(file);
            if(_extname === ".ts"){
                let _parse = parse(file);
                let checked = _queryClassesRes.find((_class)=>{
                    return _parse.name === _class.name;
                });
                return !!checked;
            }
            return false;
        });                        
        
        type ScriptBundle = {
            className: string,
            classPath: string,
            bundle: string;
        };
        let scriptBundles: ScriptBundle[] = [];
        let scriptMap: {[key: string]: string} = {};
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
    
            let check = _queryBundlesRes.find((bundle)=>{
                return script.includes(bundle.file);
            });
            
            let scriptBunlde: ScriptBundle = {
                className: parse(script).name,
                classPath: script,
                bundle: check ? check.name : "",
            };
            scriptBundles.push(scriptBunlde);

            if(scriptMap[scriptBunlde.className]){
                console.warn(`同名脚本 ${scriptBunlde.className} ,file: ${script}`);
            }
            scriptMap[scriptBunlde.className] = scriptBunlde.bundle;
        }
        return scriptBundles;
    }
}

export let fileUtils = new FileUtils();