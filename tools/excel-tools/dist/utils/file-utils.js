"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUtils = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class FileUtils {
    // 深度遍历
    DFS(root, callback, depth = 0) {
        let exists = fs_extra_1.default.existsSync(root);
        if (!exists) {
            console.log(`FileUtils-> ${root} is not exists`);
            return;
        }
        let files = fs_extra_1.default.readdirSync(root);
        let _cacheDepth = depth;
        depth++;
        files.forEach((file) => {
            let fullPath = path_1.default.join(root, file);
            let stat = fs_extra_1.default.lstatSync(fullPath);
            let isDirectory = stat.isDirectory();
            callback === null || callback === void 0 ? void 0 : callback({ isDirectory, fullPath, fileName: file, depth: _cacheDepth });
            if (!isDirectory) {
            }
            else {
                this.DFS(fullPath, callback, depth);
            }
        });
    }
    filterFile(root, filter) {
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
            // 只对文件进行判断
            if (!isDirectory) {
                let isPass = filter(file);
                if (!isPass) {
                    return;
                }
            }
            if (!isDirectory) {
                res.push(pathName);
            }
            else {
                res = res.concat(this.filterFile(pathName, filter));
            }
        });
        return res;
    }
    getFolderFiles(dir, type) {
        let exists = fs_extra_1.default.existsSync(dir);
        if (!exists) {
            console.log(`FileUtils-> ${dir} is not exists`);
            return;
        }
        let res = [];
        let files = fs_extra_1.default.readdirSync(dir);
        files.forEach((file) => {
            let fullPath = path_1.default.join(dir, file);
            let stat = fs_extra_1.default.lstatSync(fullPath);
            let isDirectory = stat.isDirectory();
            if (isDirectory) {
                if (type === 'folder') {
                    res.push({ fullPath, basename: file });
                }
            }
            else {
                if (type === 'file') {
                    res.push({ fullPath, basename: file });
                }
            }
        });
        return res;
    }
    writeJsonFile(fullPath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof data !== 'string') {
                try {
                    data = JSON.stringify(data, null, 2);
                }
                catch (error) {
                    console.log(`FileUtils->writeFile `, error);
                    return;
                }
            }
            this.writeFile(fullPath, data);
        });
    }
    writeFile(fullPath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data) {
                console.log(`FileUtils-> ${fullPath} 文件内容不能为空`);
                return;
            }
            console.log(`写入文件 ${fullPath}`);
            let dir = path_1.default.dirname(fullPath);
            yield fs_extra_1.default.mkdirp(dir);
            yield fs_extra_1.default.writeFile(fullPath, data);
            console.log(`写入完成 ${fullPath} `);
        });
    }
    /** 获取文件的 md5 */
    getMD5(buffer) {
        if (typeof buffer === 'string') {
            buffer = fs_extra_1.default.readFileSync(buffer);
        }
        let md5 = crypto_1.default.createHash("md5").update(buffer).digest("hex");
        return md5;
    }
}
exports.fileUtils = new FileUtils();
