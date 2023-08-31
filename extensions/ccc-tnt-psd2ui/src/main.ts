// @ts-ignore
import packageJSON from '../package.json';
import fs from 'fs-extra';
import path from 'path';
import Os from 'os';

import child_process from "child_process";
import { updater } from './updater';
let exec = child_process.exec;


const ENGINE_VER = "v342"; // 
const pluginPath = path.join(Editor.Project.path, "extensions", packageJSON.name);
const projectAssets = path.join(Editor.Project.path, "assets");
const cacheFile = path.join(Editor.Project.path, "local", "psd-to-prefab-cache.json");
const configFile = path.join(`${pluginPath}/config/psd.config.json`);

const nodejsFile = path.join(pluginPath, "bin", `node${Os.platform() == 'darwin' ? "" : ".exe"}`);
const commandFile = path.join(pluginPath, "libs", "psd2ui", `command.${Os.platform() == 'darwin' ? "sh" : "bat"}`);
const psdCore = path.join(pluginPath, "libs", "psd2ui", "index.js");
const packagePath = path.join(pluginPath, "package.json");


let uuid2md5: Map<string, string> = new Map();
let cacheFileJson: Record<string, any> = {};
/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },

    onClickPsd2UICache() {
        console.log(`main-> onClickPsd2UICache111 `);
        return new Promise<void>((resolve, reject) => {
            console.log(`main-> onClickPsd2UICache`);


            let options = {
                "project-assets": projectAssets,
                "cache": cacheFile,
                "init": true,
                "engine-version": ENGINE_VER
            }

            Promise.all(_exec(options, [])).then(() => {
                console.log("[psd2prefab]  执行缓存结束");
                resolve();
            });
        })
    },

    async onPsd2UIDropFiles(param) {

        let files = param.files;
        let isForceImg = param.isForceImg;
        let isImgOnly = param.isImgOnly;
        let output = param.output;
        let isPinyin = param.isPinyin;

        let options = {
            "project-assets": projectAssets,
            "cache": cacheFile,
            "engine-version": ENGINE_VER,
            "pinyin": isPinyin,
        }

        let tasks: Promise<void>[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            let stat = fs.statSync(file);
            if (stat.isFile()) {
                let ext = path.extname(file);
                if (ext != '.psd') {
                    continue;
                }
            }
            let args = JSON.parse(JSON.stringify(options));
            args["input"] = file;
            if (output) {
                args["output"] = output;
            }
            if (isImgOnly) {

                // 只导出图片
                args["img-only"] = true;
            } else {

                // 强制导出图片
                if (isForceImg) {
                    args["force-img"] = true;
                }
                args["config"] = configFile;
            }
            _exec(args, tasks)
        }

        Promise.all(tasks).then(() => {
            if (tasks.length) {
                genUUID2MD5Mapping();
                console.log("[ccc-tnt-psd2ui]  psd 导出完成，输出位置为：", output ? output : "psd 同级目录");
            }
        }).catch((reason) => {
            console.log("[ccc-tnt-psd2ui]  导出失败", reason);
        }).finally(() => {
        });
    },
};
function _exec(options: any, tasks: any) {
    let jsonContent = JSON.stringify(options);
    if (!fs.existsSync(nodejsFile)) {
        console.log(`[ccc-tnt-psd2ui] 没有内置 nodejs`, nodejsFile);

        return tasks;
    }
    // 处理权限问题
    if (Os.platform() === 'darwin') {
        if (fs.statSync(nodejsFile).mode != 33261) {
            console.log(`[ccc-tnt-psd2ui] 设置权限`);
            fs.chmodSync(nodejsFile, 33261);
        }

        if (fs.statSync(commandFile).mode != 33261) {
            console.log(`[ccc-tnt-psd2ui] commandFile 设置权限`);
            fs.chmodSync(commandFile, 33261);
        }
    }

    console.log("[ccc-tnt-psd2ui] 命令参数：" + jsonContent);
    console.log("[ccc-tnt-psd2ui] 命令执行中，执行完后请手动关闭终端窗口");

    let base64 = Buffer.from(jsonContent).toString("base64");
    tasks.push(new Promise<void>((rs) => {

        let shellScript = commandFile;  // 你的脚本路径
        let scriptArgs = `--json ${base64}`;  // 你的脚本参数

        let command =
            Os.platform() == 'darwin' ? `osascript -e 'tell app "Terminal" to do script "cd ${process.cwd()}; ${shellScript} ${scriptArgs}"'`
                : `start ${commandFile} ${scriptArgs}`;

        exec(command, (error, stdout, stderr) => {
            console.log("[ccc-tnt-psd2ui]:\n", stdout);
            if (stderr) {
                console.log(stderr);
            }
            rs();
        });
    }));
    return tasks;
}

/**
 * 资源删除的监听
 *
 * @param {*} event
 */
function onAssetDeletedListener(event: any) {
    if (uuid2md5.has(event)) {
        let md5 = uuid2md5.get(event);
        console.log(`[ccc-tnt-psd2ui] 删除资源 md5: ${md5}, uuid: ${event}`);
        delete cacheFileJson[`${md5}`];
        fs.writeFileSync(cacheFile, JSON.stringify(cacheFileJson, null, 2));
    }
}

/**
 * 生成 uuid 转 MD5 的映射
 *
 */
function genUUID2MD5Mapping() {
    if (!fs.existsSync(cacheFile)) {
        return;
    }
    let content = fs.readFileSync(cacheFile, 'utf-8');
    let obj = JSON.parse(content);
    cacheFileJson = obj;
    for (const key in obj) {
        const element = obj[key];
        uuid2md5.set(element.textureUuid, key);
    }
}

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () {
    genUUID2MD5Mapping();
    Editor.Message.addBroadcastListener("asset-db:asset-delete", onAssetDeletedListener);
    Editor.Message.addBroadcastListener("ccc-tnt-psd2ui:check-update", checkUpdate);
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {

    Editor.Message.removeBroadcastListener("asset-db:asset-delete", onAssetDeletedListener);
    Editor.Message.removeBroadcastListener("ccc-tnt-psd2ui:check-update", checkUpdate);
};


async function checkUpdate() {

    const result = await updater.checkUpdate();
    const remoteVersion = await updater.getRemoteVersion();
    if (result === -10 || result === -100) {
        console.info(`[ccc-tnt-psd2ui]：插件发现新版本：${remoteVersion}`);
        console.info(`[ccc-tnt-psd2ui]：下载地址：${packageJSON.repository.url}/releases`);
    } else if (result === -1) {
        console.log(`[ccc-tnt-psd2ui]：更新 psd2ui 运行库`);
        updateCore(remoteVersion);
    }
}

async function updateCore(remoteVersion: string) {

    // 备份当前版本
    console.log(`[ccc-tnt-psd2ui]：备份 ${psdCore}`);

    let localVersion = updater.getLocalVersion();

    try {
        let psdCoreFile = await fs.readFile(psdCore);
        await fs.writeFile(`${psdCore}.${localVersion}`, psdCoreFile, "binary");
    } catch (error) {
        console.log(`[ccc-tnt-psd2ui]：备份失败，停止更新`, error);
        return;
    }

    console.log(`[ccc-tnt-psd2ui]：备份完成，开始下载新版本`);
    try {
        let fileBuffer = await updater.downloadCoreAsBuffer("psd2ui-tools/dist/index.js");
        await fs.writeFile(psdCore, fileBuffer, "binary");
    } catch (error) {
        console.log(`[ccc-tnt-psd2ui]：更新失败`, error);
        return;
    }

    console.log(`[ccc-tnt-psd2ui]：更新版本号`);

    try {
        let packageJSON = await fs.readJson(packagePath);
        packageJSON.version = remoteVersion;
        await fs.writeJson(packagePath, packageJSON, {
            spaces: 4,
            encoding: 'utf-8'
        });
    } catch (error) {
        console.log(`[ccc-tnt-psd2ui]：更新版本号失败，下次启动会重新进行更新`);
    }

    console.log(`[ccc-tnt-psd2ui]：更新完成`);
}