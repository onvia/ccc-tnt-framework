
import compressing from 'compressing';
import fs from 'fs-extra';
import jszip from 'jszip';
import path, { join } from 'path';
import config from './config.json';
import { Octokit } from 'octokit';


const relativeFrameworkDir = "assets/scripts/framework/";
// 压缩文件名称
const zipFileName = "framework.zip";

// 静态框架源文件
const staticSourceDir = join(Editor.Project.path, "extensions/ccc-tnt-extensions/assets", zipFileName);


// // 下载目录
// const downloadPath = join(Editor.Project.path, "temp", "framework-temp");
// // 压缩文件完整路径
// const zipFileFullPath = join(downloadPath, zipFileName);
// // 解压目标位置
// const unzipTargetDir = join(downloadPath, "framework");
// // 拷贝源位置
// const copySourceDir = join(unzipTargetDir, "assets/scripts/framework");
// // 拷贝目标位置
// const copyTargetDir = join(Editor.Project.path, "assets-test/scripts/framework");

export class GenTemplate {

    async createTemplete() {

        // // 拷贝目录结构
        await this.copyTo(join(Editor.Project.path,"extensions/ccc-tnt-extensions/assets","directory-templete"),config.path);
        // 
        this.downloadFromGithub(true);
    }


    /**
     * 下载
     *
     * @param {boolean} flag 下载失败使用本地资源
     * @memberof GenTemplate
     */
    async downloadFromGithub(flag: boolean = true) {
        console.log(`GenTemplate-> 开始下载`);

        let octokit = new Octokit();
        let buffer = null;
        try {
            // 从 github 下载
            let res = await octokit.rest.repos.downloadZipballArchive({
                owner: config.owner,
                repo: config.repo,
                ref: config.ref
            })
            buffer = res.data;
            console.log(`GenTemplate-> 下载完成`);
            
        } catch (error) {
            console.log(`GenTemplate-> 下载失败`, error);
            if (flag) {
                console.log(`GenTemplate-> 使用本地静态模板`);
                // 下载失败使用本地静态资源
                buffer = await fs.readFile(staticSourceDir, { encoding: "binary" });
            }
        }
        // 解压      
        this.unzip(buffer);
    }

    // 解压资源
    unzip(buffer) {
        if (!buffer) {
            return;
        }
        fs.emptyDirSync(path.join(config.path,"framework"));
        console.log(`GenTemplate-> 开始解压`);
        jszip.loadAsync(buffer).then(zip => {
            let datas = [];
            zip.forEach(function (relativePath, file) {
                if (relativePath.includes(relativeFrameworkDir)) {
                    datas.push({ url: relativePath, file: file });
                }
            })
            let call = () => {
                let data = datas.shift();
                if (data == null) {
                    console.log(`GenTemplate-> 解压完成`);
                    return;
                }
                let newUrl = data.url.split(relativeFrameworkDir)[1];
                if (data.file.dir) {
                    if (newUrl.endsWith('/')) {
                        newUrl = newUrl.substring(0, newUrl.length - 1);
                    }
                    let dir = path.join(config.path, "framework", newUrl);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    call();
                } else {
                    data.file.async('nodebuffer').then(res => {
                        fs.writeFileSync(path.join(config.path, "framework", newUrl), res);
                        call();
                    })
                }
            }
            call();
        })
    }

    // 整包解压
    saveZipFiles(savePath: string, files: any) {

        // 整包解压
        // jszip.loadAsync(buffer).then((zip) => {
        //     saveZipFiles(path.join(__dirname, "..", "download"), zip.files);
        // });

        // 获取解压后的文件
        try {
            for (const filename of Object.keys(files)) {
                const dest = path.join(savePath, filename);
                // 如果该文件为目录需先创建文件夹
                if (files[filename].dir) {
                    if ((!fs.existsSync(dest) || fs.statSync(dest).isFile())) {
                        fs.mkdirSync(dest, {
                            recursive: true
                        });
                    }
                    continue;
                }
                // 把每个文件buffer写到硬盘中 
                files[filename].async('nodebuffer')
                    .then(content => fs.writeFileSync(dest, content));
            }
        } catch (error) {
            console.error('save zip files encountered error!', error.message);
            return error;
        }
    }



    // // 解压
    // async unzipSync(source: string, dest: string){
    //     return new Promise<void>((resolve,reject)=>{
    //       //解压 .zip
    //       compressing.zip.uncompress(source, dest).then((res) => {
    //         console.log(`GenTemplate-> 解压成功`);
    //         resolve();
    //       }).catch(() => {
    //         console.log(`GenTemplate-> 解压失败`);
    //         reject();
    //       });
    //     })
    // }

    // 复制
    async copyTo(src: string, dest: string) {

        console.log(`GenTemplate-> 开始拷贝  从 ${src} 到 ${dest}`);
        await fs.copy(src, dest).then(() => {
            console.log(`GenTemplate-> 拷贝成功`);
        }).catch(() => {
            console.log(`GenTemplate-> 拷贝失败`);
        });

    }
}

export const genTemplate = new GenTemplate();