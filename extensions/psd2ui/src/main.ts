//@ts-ignore
import packageJSON from '../package.json';
import fs from 'fs-extra';
import path from 'path';

import child_process from "child_process";
let exec = child_process.exec;


const ENGINE_VER = "v342";
const projectAssets = path.join(Editor.Project.path, "assets");
const cacheFile = path.join(Editor.Project.path, "local", "psd-to-prefab-cache.json");
const commandBat = path.join(Editor.Project.path, "extensions\\psd2ui\\libs\\psd2ui\\command.bat");
const psd2uiJS = path.join(Editor.Project.path, "extensions\\psd2ui\\libs\\psd2ui\\index.js");
const configFile = path.join(Editor.Project.path, "extensions\\psd2ui\\config\\psd.config.json");
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
            let cmds = 'start ' + commandBat + ' ' + `--project-assets ${projectAssets} --cache ${cacheFile} --init`;
            console.log(cmds)

            exec(cmds, { windowsHide: false }, (err, stdout, stderr) => {

                console.log("[psd2prefab]  执行缓存结束");
                resolve();
            })
        })
    },

    async onPsd2UIDropFiles(param) {

        let files = param.files;
        let isForceImg = param.isForceImg;
        let isImgOnly = param.isImgOnly;
        let output = param.output

        let options = {
            "project-assets": projectAssets,
            "cache": cacheFile,
            "engine-version": ENGINE_VER,
        }

        let tasks = [];
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
            let jsonContent = JSON.stringify(args);

            console.log("批处理命令参数：" + jsonContent);
            let base64 = Buffer.from(jsonContent).toString("base64");

            console.log('start ' + commandBat + ' ' + `--json ${base64}`);
            tasks.push(new Promise<void>((rs) => {
                exec('start ' + commandBat + ' ' + `--json ${base64}`, { windowsHide: false }, (err, stdout, stderr) => {
                    rs();
                })
            }));
        }

        await Promise.all(tasks);

        console.log("[psd2ui]  psd 导出完成");
    },
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () {

};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {

};
