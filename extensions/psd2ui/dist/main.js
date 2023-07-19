"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
let exec = child_process_1.default.exec;
const ENGINE_VER = "v342"; // 
const projectAssets = path_1.default.join(Editor.Project.path, "assets");
const cacheFile = path_1.default.join(Editor.Project.path, "local", "psd-to-prefab-cache.json");
const commandBat = path_1.default.join(Editor.Project.path, "extensions\\psd2ui\\libs\\psd2ui\\command.bat");
const psd2uiJS = path_1.default.join(Editor.Project.path, "extensions\\psd2ui\\libs\\psd2ui\\index.js");
const configFile = path_1.default.join(Editor.Project.path, "extensions\\psd2ui\\config\\psd.config.json");
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
        let options = {
            "project-assets": projectAssets,
            "cache": cacheFile,
            "engine-version": ENGINE_VER,
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
        await Promise.all(tasks);
        console.log("[psd2ui]  psd 导出完成");
    },
};
function _exec(options, tasks) {
    let jsonContent = JSON.stringify(options);
    console.log("批处理命令参数：" + jsonContent);
    let base64 = Buffer.from(jsonContent).toString("base64");
    console.log('start ' + commandBat + ' ' + `--json ${base64}`);
    tasks.push(new Promise((rs) => {
        exec('start ' + commandBat + ' ' + `--json ${base64}`, { windowsHide: false }, (err, stdout, stderr) => {
            rs();
        });
    }));
    return tasks;
}
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () {
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
};
exports.unload = unload;
