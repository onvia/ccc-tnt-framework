"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const child_process_1 = __importDefault(require("child_process"));
const updater_1 = require("./updater");
let exec = child_process_1.default.exec;
const ENGINE_VER = "v342"; // 
const pluginPath = path_1.default.join(Editor.Project.path, "extensions", package_json_1.default.name);
const projectAssets = path_1.default.join(Editor.Project.path, "assets");
const cacheFile = path_1.default.join(Editor.Project.path, "local", "psd-to-prefab-cache.json");
const configFile = path_1.default.join(`${pluginPath}/config/psd.config.json`);
const nodejsFile = path_1.default.join(pluginPath, "bin", `node${os_1.default.platform() == 'darwin' ? "" : ".exe"}`);
const commandFile = path_1.default.join(pluginPath, "libs", "psd2ui", `command.${os_1.default.platform() == 'darwin' ? "sh" : "bat"}`);
const psdCore = path_1.default.join(pluginPath, "libs", "psd2ui", "index.js");
const packagePath = path_1.default.join(pluginPath, "package.json");
let uuid2md5 = new Map();
let cacheFileJson = {};
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    openPanel() {
        Editor.Panel.open(package_json_1.default.name);
    },
    onClickPsd2UICache() {
        console.log(`main-> onClickPsd2UICache111 `);
        return new Promise((resolve, reject) => {
            console.log(`main-> onClickPsd2UICache`);
            let options = {
                "project-assets": projectAssets,
                "cache": cacheFile,
                "init": true,
                "engine-version": ENGINE_VER
            };
            Promise.all(_exec(options, [])).then(() => {
                console.log("[psd2prefab]  执行缓存结束");
                resolve();
            });
        });
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
        };
        let tasks = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let stat = fs_extra_1.default.statSync(file);
            if (stat.isFile()) {
                let ext = path_1.default.extname(file);
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
            }
            else {
                // 强制导出图片
                if (isForceImg) {
                    args["force-img"] = true;
                }
                args["config"] = configFile;
            }
            _exec(args, tasks);
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
function _exec(options, tasks) {
    let jsonContent = JSON.stringify(options);
    if (!fs_extra_1.default.existsSync(nodejsFile)) {
        console.log(`[ccc-tnt-psd2ui] 没有内置 nodejs`, nodejsFile);
        return tasks;
    }
    // 处理权限问题
    if (os_1.default.platform() === 'darwin') {
        if (fs_extra_1.default.statSync(nodejsFile).mode != 33261) {
            console.log(`[ccc-tnt-psd2ui] 设置权限`);
            fs_extra_1.default.chmodSync(nodejsFile, 33261);
        }
        if (fs_extra_1.default.statSync(commandFile).mode != 33261) {
            console.log(`[ccc-tnt-psd2ui] commandFile 设置权限`);
            fs_extra_1.default.chmodSync(commandFile, 33261);
        }
    }
    console.log("[ccc-tnt-psd2ui] 命令参数：" + jsonContent);
    console.log("[ccc-tnt-psd2ui] 命令执行中，执行完后请手动关闭终端窗口");
    let base64 = Buffer.from(jsonContent).toString("base64");
    tasks.push(new Promise((rs) => {
        let shellScript = commandFile; // 你的脚本路径
        let scriptArgs = `--json ${base64}`; // 你的脚本参数
        let command = os_1.default.platform() == 'darwin' ? `osascript -e 'tell app "Terminal" to do script "cd ${process.cwd()}; ${shellScript} ${scriptArgs}"'`
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
function onAssetDeletedListener(event) {
    if (uuid2md5.has(event)) {
        let md5 = uuid2md5.get(event);
        console.log(`[ccc-tnt-psd2ui] 删除资源 md5: ${md5}, uuid: ${event}`);
        delete cacheFileJson[`${md5}`];
        fs_extra_1.default.writeFileSync(cacheFile, JSON.stringify(cacheFileJson, null, 2));
    }
}
/**
 * 生成 uuid 转 MD5 的映射
 *
 */
function genUUID2MD5Mapping() {
    if (!fs_extra_1.default.existsSync(cacheFile)) {
        return;
    }
    let content = fs_extra_1.default.readFileSync(cacheFile, 'utf-8');
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
const load = function () {
    genUUID2MD5Mapping();
    Editor.Message.addBroadcastListener("asset-db:asset-delete", onAssetDeletedListener);
    Editor.Message.addBroadcastListener("ccc-tnt-psd2ui:check-update", checkUpdate);
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
    Editor.Message.removeBroadcastListener("asset-db:asset-delete", onAssetDeletedListener);
    Editor.Message.removeBroadcastListener("ccc-tnt-psd2ui:check-update", checkUpdate);
};
exports.unload = unload;
async function checkUpdate() {
    const result = await updater_1.updater.checkUpdate();
    const remoteVersion = await updater_1.updater.getRemoteVersion();
    if (result === -10 || result === -100) {
        console.info(`[ccc-tnt-psd2ui]：插件发现新版本：${remoteVersion}`);
        console.info(`[ccc-tnt-psd2ui]：下载地址：${package_json_1.default.repository.url}/releases`);
    }
    else if (result === -1) {
        console.log(`[ccc-tnt-psd2ui]：更新 psd2ui 运行库`);
        updateCore(remoteVersion);
    }
}
async function updateCore(remoteVersion) {
    // 备份当前版本
    console.log(`[ccc-tnt-psd2ui]：备份 ${psdCore}`);
    let localVersion = updater_1.updater.getLocalVersion();
    try {
        let psdCoreFile = await fs_extra_1.default.readFile(psdCore);
        await fs_extra_1.default.writeFile(`${psdCore}.${localVersion}`, psdCoreFile, "binary");
    }
    catch (error) {
        console.log(`[ccc-tnt-psd2ui]：备份失败，停止更新`, error);
        return;
    }
    console.log(`[ccc-tnt-psd2ui]：备份完成，开始下载新版本`);
    try {
        let fileBuffer = await updater_1.updater.downloadCoreAsBuffer("psd2ui-tools/dist/index.js");
        await fs_extra_1.default.writeFile(psdCore, fileBuffer, "binary");
    }
    catch (error) {
        console.log(`[ccc-tnt-psd2ui]：更新失败`, error);
        return;
    }
    console.log(`[ccc-tnt-psd2ui]：更新版本号`);
    try {
        let packageJSON = await fs_extra_1.default.readJson(packagePath);
        packageJSON.version = remoteVersion;
        await fs_extra_1.default.writeJson(packagePath, packageJSON, {
            spaces: 4,
            encoding: 'utf-8'
        });
    }
    catch (error) {
        console.log(`[ccc-tnt-psd2ui]：更新版本号失败，下次启动会重新进行更新`);
    }
    console.log(`[ccc-tnt-psd2ui]：更新完成`);
}
