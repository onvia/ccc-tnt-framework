
import fs from 'fs-extra';
import jszip from 'jszip';
import path from 'path';
import config from './config';
import { Octokit } from 'octokit';
import download from 'download';

// github 镜像加速
const githubProxy = 'https://ghproxy.com/';

export class GenTemplate {

    async createTemplete() {

        // if (Editor.Project.name == 'ccc-tnt-framework') {
        //     console.log(`[TNT] 框架项目无法下载自身仓库的资源`);
        //     return;
        // }
        // // 拷贝目录结构
        // await this.copyTo(join(Editor.Project.path,"extensions/ccc-tnt-extensions/assets","directory-templete"),config.path);
        // 
        // this.downloadFromGithub(true);
        this.downloadRelease();
    }

    async downloadRelease() {
        let octokit = new Octokit();
        try {
            console.log(`[TNT] 获取最新版框架`);
            let lastRelease = await octokit.rest.repos.getLatestRelease({
                'owner': config.owner,
                'repo': config.repo,
            });
            let asset = lastRelease.data.assets[0]
            // lastRelease.data.tag_name
            if (!fs.existsSync(config.path)) {
                fs.mkdirSync(config.path);
            }
            // fs.emptyDirSync(config.path);
            console.log(`[TNT] 下载`);
            let buffer = await download(githubProxy + asset.browser_download_url);
            console.log(`[TNT] 解压`);
            //   整包解压
            jszip.loadAsync(buffer).then((zip) => {
                console.log(`[TNT] 解压文件`, zip.files);

                this.saveZipFiles(path.join(config.path), zip.files);
            }).then(async () => {
                console.log(`[TNT] 刷新框架`);
                await Editor.Message.request("asset-db", "refresh-asset", "db://assets/a-framework");
                console.log(`[TNT] 请重启编辑器`);
            });
        } catch (error) {
            console.log(`[TNT] 获取资源失败`, error);
        }
    }

    // 整包解压
    /**
     * 使用 
     *      jszip.loadAsync(buffer).then((zip) => {
     *        saveZipFiles(path.join(__dirname, "..", "download"), zip.files);
     *      });
     *
     * @param {string} savePath
     * @param {*} files
     * @return {*} 
     * @memberof GenTemplate
     */
    saveZipFiles(savePath: string, files: any) {

        // 获取解压后的文件
        try {
            for (const filename of Object.keys(files)) {
                // 将最上层 assets 文件夹去除掉
                const dest = path.join(savePath, filename.replace("assets/", ""));
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
                    .then(content => {

                        fs.writeFileSync(dest, content)
                    });
            }
        } catch (error) {
            console.error('save zip files encountered error!', error.message);
            return error;
        }
    }
    // /**
    //  * 下载
    //  *
    //  * @param {boolean} flag 下载失败使用本地资源
    //  * @memberof GenTemplate
    //  */
    // async downloadFromGithub(flag: boolean = true) {
    //     console.log(`[TNT] 开始下载`);

    //     let octokit = new Octokit();
    //     let buffer = null;
    //     try {
    //         // 从 github 下载
    //         let res = await octokit.rest.repos.downloadZipballArchive({
    //             owner: config.owner,
    //             repo: config.repo,
    //             ref: config.ref
    //         })
    //         buffer = res.data;
    //         console.log(`[TNT] 下载完成`);

    //     } catch (error) {
    //         console.log(`[TNT] 下载失败`, error);
    //         if (flag) {
    //             console.log(`[TNT] 使用本地静态模板`);
    //             // 下载失败使用本地静态资源
    //             buffer = await fs.readFile(staticSourceDir, { encoding: "binary" });
    //         }
    //     }
    //     // 解压      
    //     this.unzip(buffer);
    // }

    // // 解压资源
    // unzip(buffer) {
    //     if (!buffer) {
    //         return;
    //     }
    //     fs.emptyDirSync(path.join(config.path, "framework"));
    //     console.log(`[TNT] 开始解压`);
    //     jszip.loadAsync(buffer).then(zip => {
    //         let datas = [];
    //         zip.forEach(function (relativePath, file) {
    //             if (relativePath.includes(relativeFrameworkDir)) {
    //                 datas.push({ url: relativePath, file: file });
    //             }
    //         })
    //         let call = () => {
    //             let data = datas.shift();
    //             if (data == null) {
    //                 console.log(`[TNT] 解压完成`);
    //                 return;
    //             }
    //             let newUrl = data.url.split(relativeFrameworkDir)[1];
    //             if (data.file.dir) {
    //                 if (newUrl.endsWith('/')) {
    //                     newUrl = newUrl.substring(0, newUrl.length - 1);
    //                 }
    //                 let dir = path.join(config.path, "framework", newUrl);
    //                 if (!fs.existsSync(dir)) {
    //                     fs.mkdirSync(dir);
    //                 }
    //                 call();
    //             } else {
    //                 data.file.async('nodebuffer').then(res => {
    //                     fs.writeFileSync(path.join(config.path, "framework", newUrl), res);
    //                     call();
    //                 })
    //             }
    //         }
    //         call();
    //     })
    // }




    // // 解压
    // async unzipSync(source: string, dest: string){
    //     return new Promise<void>((resolve,reject)=>{
    //       //解压 .zip
    //       compressing.zip.uncompress(source, dest).then((res) => {
    //         console.log(`[TNT] 解压成功`);
    //         resolve();
    //       }).catch(() => {
    //         console.log(`[TNT] 解压失败`);
    //         reject();
    //       });
    //     })
    // }

    // 复制
    async copyTo(src: string, dest: string) {

        console.log(`[TNT] 开始拷贝  从 ${src} 到 ${dest}`);
        await fs.copy(src, dest).then(() => {
            console.log(`[TNT] 拷贝成功`);
        }).catch(() => {
            console.log(`[TNT] 拷贝失败`);
        });

    }
}

export const genTemplate = new GenTemplate();