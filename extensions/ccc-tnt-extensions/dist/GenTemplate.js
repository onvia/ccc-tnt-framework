"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genTemplate = exports.GenTemplate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const jszip_1 = __importDefault(require("jszip"));
const path_1 = __importStar(require("path"));
const config_json_1 = __importDefault(require("./config.json"));
const octokit_1 = require("octokit");
const relativeFrameworkDir = "assets/scripts/framework/";
// 压缩文件名称
const zipFileName = "framework.zip";
// 静态框架源文件
const staticSourceDir = (0, path_1.join)(Editor.Project.path, "extensions/ccc-fw-tree/assets", zipFileName);
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
class GenTemplate {
    async createTemplete() {
        // // 拷贝目录结构
        await this.copyTo((0, path_1.join)(Editor.Project.path, "extensions/ccc-fw-tree/assets", "directory-templete"), config_json_1.default.path);
        // 
        this.downloadFromGithub(true);
    }
    /**
     * 下载
     *
     * @param {boolean} flag 下载失败使用本地资源
     * @memberof GenTemplate
     */
    async downloadFromGithub(flag = true) {
        console.log(`GenTemplate-> 开始下载`);
        let octokit = new octokit_1.Octokit();
        let buffer = null;
        try {
            // 从 github 下载
            let res = await octokit.rest.repos.downloadZipballArchive({
                owner: config_json_1.default.owner,
                repo: config_json_1.default.repo,
                ref: config_json_1.default.ref
            });
            buffer = res.data;
            console.log(`GenTemplate-> 下载完成`);
        }
        catch (error) {
            console.log(`GenTemplate-> 下载失败`, error);
            if (flag) {
                console.log(`GenTemplate-> 使用本地静态模板`);
                // 下载失败使用本地静态资源
                buffer = await fs_extra_1.default.readFile(staticSourceDir, { encoding: "binary" });
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
        fs_extra_1.default.emptyDirSync(path_1.default.join(config_json_1.default.path, "framework"));
        console.log(`GenTemplate-> 开始解压`);
        jszip_1.default.loadAsync(buffer).then(zip => {
            let datas = [];
            zip.forEach(function (relativePath, file) {
                if (relativePath.includes(relativeFrameworkDir)) {
                    datas.push({ url: relativePath, file: file });
                }
            });
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
                    let dir = path_1.default.join(config_json_1.default.path, "framework", newUrl);
                    if (!fs_extra_1.default.existsSync(dir)) {
                        fs_extra_1.default.mkdirSync(dir);
                    }
                    call();
                }
                else {
                    data.file.async('nodebuffer').then(res => {
                        fs_extra_1.default.writeFileSync(path_1.default.join(config_json_1.default.path, "framework", newUrl), res);
                        call();
                    });
                }
            };
            call();
        });
    }
    // 整包解压
    saveZipFiles(savePath, files) {
        // 整包解压
        // jszip.loadAsync(buffer).then((zip) => {
        //     saveZipFiles(path.join(__dirname, "..", "download"), zip.files);
        // });
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
                // 把每个文件buffer写到硬盘中 
                files[filename].async('nodebuffer')
                    .then(content => fs_extra_1.default.writeFileSync(dest, content));
            }
        }
        catch (error) {
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
