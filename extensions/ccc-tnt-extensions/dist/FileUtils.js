"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUtils = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const path_2 = require("path");
const AssetDir = `${Editor.Project.path}/assets`;
class FileUtils {
    getAllFiles(root, filter) {
        let exists = fs_extra_1.default.existsSync(root);
        if (!exists) {
            console.log(`FileUtils-> ${root} is not exists`);
            return;
        }
        var res = [];
        let files = fs_extra_1.default.readdirSync(root);
        files.forEach((file) => {
            let pathName = path_1.default.join(root, file);
            let stat = fs_extra_1.default.lstatSync(pathName);
            let isDirectory = stat.isDirectory();
            let isPass = filter(isDirectory, file);
            if (!isPass) {
                return;
            }
            if (!isDirectory) {
                res.push(pathName);
            }
            else {
                res = res.concat(this.getAllFiles(pathName, filter));
            }
        });
        return res;
    }
    async writeFile(fullPath, data) {
        if (typeof data !== 'string') {
            try {
                data = JSON.stringify(data, null, 4);
            }
            catch (error) {
                console.log(`FileUtils->writeFile `, error);
                return;
            }
        }
        console.log(`写入文件 ${fullPath}`);
        let dir = path_1.default.dirname(fullPath);
        await fs_extra_1.default.mkdirp(dir);
        await fs_extra_1.default.writeFile(fullPath, data);
        console.log(`写入完成 ${fullPath} `);
    }
    /**
     * 查询类
     *
     * @param {string} baseClass 基类，如果填写，则查询到的是 他的所有子类
     * @return {*}
     * @memberof FileUtils
     */
    async queryClass(baseClass) {
        // 查询所有 继承自 UIBase 的类
        let _queryClassesRes = await Editor.Message.request("scene", "query-classes", { extends: baseClass });
        // 查询所有 bundle
        let _queryBundlesRes = await Editor.Message.request("asset-db", "query-assets", { isBundle: true, });
        // 查询类的全路径
        let scripts = exports.fileUtils.getAllFiles(AssetDir, (isDirectory, file) => {
            if (isDirectory) {
                return true;
            }
            let _extname = (0, path_2.extname)(file);
            if (_extname === ".ts") {
                let _parse = (0, path_2.parse)(file);
                let checked = _queryClassesRes.find((_class) => {
                    return _parse.name === _class.name;
                });
                return !!checked;
            }
            return false;
        });
        let scriptBundles = [];
        let scriptMap = {};
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            let check = _queryBundlesRes.find((bundle) => {
                return script.includes(bundle.file);
            });
            let scriptBunlde = {
                className: (0, path_2.parse)(script).name,
                classPath: script,
                bundle: check ? check.name : "",
            };
            scriptBundles.push(scriptBunlde);
            if (scriptMap[scriptBunlde.className]) {
                console.warn(`同名脚本 ${scriptBunlde.className} ,file: ${script}`);
            }
            scriptMap[scriptBunlde.className] = scriptBunlde.bundle;
        }
        return scriptBundles;
    }
}
exports.fileUtils = new FileUtils();
