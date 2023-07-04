
import fs from 'fs-extra';
import jszip from 'jszip';
import path from 'path';
import config from './config';
import { Octokit } from 'octokit';
import download from 'download';

// github 镜像加速
const githubProxy = 'https://ghproxy.com/';
const framework = "a-framework"

export class GenTemplate {

    async checkUpdate() {
        console.log(`[TNT] 检查更新。`);
        let versionPath = path.join(Editor.Project.path, "assets", framework, "tnt-version.json");
        let tntPath = path.join(Editor.Project.path, "assets", framework, "TNT.ts");
        let tntExists = fs.existsSync(tntPath);
        let versionExists = fs.existsSync(versionPath);
        if (tntExists && versionExists) {
            // 进行版本对比
            let octokit = new Octokit();
            let lastRelease = await octokit.rest.repos.getLatestRelease({
                'owner': config.owner,
                'repo': config.repo,
            });
            let localVersionContent = fs.readFileSync(versionPath, 'utf-8');
            let localVersionConfig = JSON.parse(localVersionContent);

            let remoteVersion = lastRelease.data.tag_name;
            let result = this._versionCompareHandle(remoteVersion, localVersionConfig.version);
            if (result > 0) {
                // 更新
                console.log(`[TNT] 框架发现新版本。当前版本： ${localVersionConfig.version}，新版本： ${remoteVersion}`);
            } else {
                console.log(`[TNT] 框架无更新。`);
            }
        } else if (tntExists && !versionExists) {
            console.log(`[TNT] 版本文件不存在，无法检测版本更新。`);
        } else if (!tntExists && !versionExists) {
            console.log(`[TNT] 框架不存在，请下载。`);
        }
    }

    async createTemplete() {

        if (Editor.Project.name == 'ccc-tnt-framework') {
            console.log(`[TNT] 框架项目无法下载自身仓库的资源`);
            return;
        }

        Editor.Dialog.info("点击确定更新 [TNT] 框架", { 'buttons': ['确定', '取消'] }).then((result) => {
            if (result.response === 0) {
                this.downloadRelease();
            } else {
                console.log('[TNT] 取消更新');
            }
        })
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
                await Editor.Message.request("asset-db", "refresh-asset", `db://assets/${framework}`);
                console.log(`[TNT] 下载框架完成，如果有报错请重启编辑器。`);
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
                    .then(content => {

                        fs.writeFileSync(dest, content)
                    });
            }
        } catch (error) {
            console.error('save zip files encountered error!', error.message);
            return error;
        }
    }

    private _versionCompareHandle(remoteVersion: string, localVersion: string): number {

        if (remoteVersion.startsWith("v")) {
            remoteVersion = remoteVersion.replace('v', "");
        }
        if (localVersion.startsWith("v")) {
            localVersion = localVersion.replace('v', "");
        }

        let remoteSplitResult = remoteVersion.split('-');
        let localSplitResult = localVersion.split('-');
        let remoteSuffixNum = 0;
        let localSuffixNum = 0;
        if (remoteSplitResult.length == 2) {
            remoteVersion = remoteSplitResult[0];
            remoteSuffixNum = this.digitization(remoteSplitResult[1]);
        }

        if (localSplitResult.length == 2) {
            localVersion = localSplitResult[0];
            localSuffixNum = this.digitization(localSplitResult[1]);
        }


        var vA = remoteVersion.split('.');
        var vB = localVersion.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || '0');
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            // return 0;
            return remoteSuffixNum - localSuffixNum;
        }
    }

    digitization(tag: string) {
        if (tag.toLocaleLowerCase() === 'beta') {
            return 1;
        }
        if (tag.toLocaleLowerCase() === 'release' || tag == '') {
            return 2;
        }
        return 0;
    }

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