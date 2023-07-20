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
exports.imageCacheMgr = exports.ImageCacheMgr = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const EditorVersion_1 = require("../EditorVersion");
const FileUtils_1 = require("../utils/FileUtils");
class ImageCacheMgr {
    constructor() {
        this._imageMap = new Map();
        this._cachePath = null;
    }
    initWithPath(_path) {
        if (!fs_extra_1.default.existsSync(_path)) {
            console.log(`ImageCacheMgr-> 文件不存在: ${_path}`);
            return;
        }
        this._cachePath = _path;
        let content = fs_extra_1.default.readFileSync(_path, "utf-8");
        this.initWithFile(content);
    }
    initWithFile(file) {
        let json = JSON.parse(file);
        this.initWithJson(json);
    }
    initWithJson(json) {
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                this._imageMap.set(key, json[key]);
            }
        }
    }
    set(md5, warp) {
        this._imageMap.set(md5, warp);
    }
    has(md5) {
        return this._imageMap.has(md5);
    }
    get(md5) {
        return this._imageMap.get(md5);
    }
    saveImageMap(_path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_path) {
                _path = this._cachePath;
            }
            if (!_path) {
                console.log(`ImageCacheMgr-> 缓存路径 [${_path}] 不存在，无法保存  `);
                return;
            }
            let obj = Object.create(null);
            this._imageMap.forEach((v, k) => {
                obj[k] = v;
            });
            let content = JSON.stringify(obj, null, 2);
            yield FileUtils_1.fileUtils.writeFile(_path, content);
        });
    }
    // 获取已存在的图片，生成 md5: uuid 映射,
    loadImages(dir) {
        if (this._imageMap.size > 0) {
            console.error(`ImageCacheMgr-> 暂时只能在 启动时加载`);
            return;
        }
        let pngs = FileUtils_1.fileUtils.filterFile(dir, (fileName) => {
            let extname = path_1.default.extname(fileName);
            if (extname == ".png") {
                return true;
            }
            return false;
        });
        for (let i = 0; i < pngs.length; i++) {
            const png = pngs[i];
            let md5 = FileUtils_1.fileUtils.getMD5(png);
            console.log(`ImageCacheMgr->缓存 `, png);
            let imageWarp = this._loadImageMetaWarp(`${png}.meta`);
            if (imageWarp) {
                this.set(md5, imageWarp);
            }
        }
    }
    _loadImageMetaWarp(_path) {
        let content = fs_extra_1.default.readFileSync(_path, { encoding: "utf-8" });
        let imageWarp = null;
        switch (config_1.config.editorVersion) {
            case EditorVersion_1.EditorVersion.v249:
                imageWarp = this._loadImageMeta249(content, _path);
                break;
            default:
                console.log(`ImageCacheMgr-> 暂未实现 ${EditorVersion_1.EditorVersion[config_1.config.editorVersion]} 版本`);
                break;
        }
        return imageWarp;
    }
    _loadImageMeta249(metaContent, _path) {
        var _a;
        let filename = path_1.default.basename(_path, ".png.meta");
        let fullpath = path_1.default.join(path_1.default.dirname(_path), `${filename}.png`);
        let metaJson = JSON.parse(metaContent);
        if (!((_a = metaJson === null || metaJson === void 0 ? void 0 : metaJson.subMetas) === null || _a === void 0 ? void 0 : _a[filename])) {
            return null;
        }
        let imageWarp = {
            path: fullpath,
            textureUuid: metaJson.subMetas[filename].uuid,
            uuid: metaJson.uuid,
            isOutput: true,
        };
        return imageWarp;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ImageCacheMgr();
        }
        return this._instance;
    }
}
exports.ImageCacheMgr = ImageCacheMgr;
ImageCacheMgr._instance = null;
exports.imageCacheMgr = ImageCacheMgr.getInstance();
