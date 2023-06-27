"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genTemplate = exports.GenTemplate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const jszip_1 = __importDefault(require("jszip"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const octokit_1 = require("octokit");
const download_1 = __importDefault(require("download"));
// github 镜像加速
const githubProxy = 'https://ghproxy.com/';
class GenTemplate {
    async createTemplete() {
        if (Editor.Project.name == 'ccc-tnt-framework') {
            console.log(`GenTemplate-> 框架项目无法下载自身仓库的资源`);
            return;
        }
        // // 拷贝目录结构
        // await this.copyTo(join(Editor.Project.path,"extensions/ccc-tnt-extensions/assets","directory-templete"),config.path);
        // 
        // this.downloadFromGithub(true);
        this.downloadRelease();
    }
    async downloadRelease() {
        let octokit = new octokit_1.Octokit();
        try {
            console.log(`GenTemplate-> 获取最新版框架`);
            let lastRelease = await octokit.rest.repos.getLatestRelease({
                'owner': config_1.default.owner,
                'repo': config_1.default.repo,
            });
            let asset = lastRelease.data.assets[0];
            // lastRelease.data.tag_name
            if (!fs_extra_1.default.existsSync(config_1.default.path)) {
                fs_extra_1.default.mkdirSync(config_1.default.path);
            }
            fs_extra_1.default.emptyDirSync(config_1.default.path);
            console.log(`GenTemplate-> 下载`);
            let buffer = await (0, download_1.default)(githubProxy + asset.browser_download_url);
            console.log(`GenTemplate-> 解压`);
            //   整包解压
            jszip_1.default.loadAsync(buffer).then((zip) => {
                console.log(`GenTemplate-> 解压文件`, zip.files);
                this.saveZipFiles(path_1.default.join(config_1.default.path), zip.files);
            });
        }
        catch (error) {
            console.log(`GenTemplate-> 获取资源失败`, error);
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
    saveZipFiles(savePath, files) {
        // 获取解压后的文件
        try {
            for (const filename of Object.keys(files)) {
                const dest = path_1.default.join(savePath, filename);
                // 如果该文件为目录需先创建文件夹
                if (files[filename].dir) {
                    if ((!fs_extra_1.default.existsSync(dest) || fs_extra_1.default.statSync(dest).isFile())) {
                        fs_extra_1.default.mkdirSync(dest, {
                            recursive: true
                        });
                    }
                    continue;
                }
                console.log(`GenTemplate-> 写文件 ${filename}`, files[filename]);
                // 把每个文件buffer写到硬盘中 
                files[filename].async('nodebuffer')
                    .then(content => {
                    fs_extra_1.default.writeFileSync(dest, content);
                });
            }
        }
        catch (error) {
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
    //     console.log(`GenTemplate-> 开始下载`);
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
    //         console.log(`GenTemplate-> 下载完成`);
    //     } catch (error) {
    //         console.log(`GenTemplate-> 下载失败`, error);
    //         if (flag) {
    //             console.log(`GenTemplate-> 使用本地静态模板`);
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
    //     console.log(`GenTemplate-> 开始解压`);
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
    //                 console.log(`GenTemplate-> 解压完成`);
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
    //         console.log(`GenTemplate-> 解压成功`);
    //         resolve();
    //       }).catch(() => {
    //         console.log(`GenTemplate-> 解压失败`);
    //         reject();
    //       });
    //     })
    // }
    // 复制
    async copyTo(src, dest) {
        console.log(`GenTemplate-> 开始拷贝  从 ${src} 到 ${dest}`);
        await fs_extra_1.default.copy(src, dest).then(() => {
            console.log(`GenTemplate-> 拷贝成功`);
        }).catch(() => {
            console.log(`GenTemplate-> 拷贝失败`);
        });
    }
}
exports.GenTemplate = GenTemplate;
exports.genTemplate = new GenTemplate();
