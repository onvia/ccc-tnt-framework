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
exports.exportImageMgr = void 0;
require("ag-psd/initialize-canvas"); // only needed for reading image data and thumbnails
const psd = __importStar(require("ag-psd"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ImageMgr_1 = require("./assets-manager/ImageMgr");
const FileUtils_1 = require("./utils/FileUtils");
const Parser_1 = require("./Parser");
const PsdGroup_1 = require("./psd/PsdGroup");
const PsdText_1 = require("./psd/PsdText");
class ExportImageMgr {
    constructor() {
        this.textObjects = [];
    }
    test() {
        const outDir = path_1.default.join(__dirname, "..", "out");
        let psdPath = "./test-img-only/境界奖励-优化.psd";
        this.parsePsd(psdPath, outDir);
    }
    exec(args) {
        return __awaiter(this, void 0, void 0, function* () {
            // 检查参数
            if (!this.checkArgs(args)) {
                return;
            }
            // 判断输入是文件夹还是文件
            let stat = fs_extra_1.default.lstatSync(args.input);
            let isDirectory = stat.isDirectory();
            if (isDirectory) {
                if (!args.output) {
                    args.output = path_1.default.join(args.input, "psd2ui");
                }
                this.parsePsdDir(args.input, args.output);
            }
            else {
                if (!args.output) {
                    let input_dir = path_1.default.dirname(args.input);
                    args.output = path_1.default.join(input_dir, "psd2ui");
                }
                this.parsePsd(args.input, args.output);
            }
        });
    }
    // 检查参数
    checkArgs(args) {
        if (!args.input) {
            console.error(`请设置 --input`);
            return false;
        }
        if (!fs_extra_1.default.existsSync(args.input)) {
            console.error(`输入路径不存在: ${args.input}`);
            return false;
        }
        return true;
    }
    parsePsdDir(dir, outDir) {
        return __awaiter(this, void 0, void 0, function* () {
            // 清空目录
            fs_extra_1.default.emptyDirSync(outDir);
            let psds = FileUtils_1.fileUtils.filterFile(dir, (fileName) => {
                let extname = path_1.default.extname(fileName);
                if (extname == ".psd") {
                    return true;
                }
                return false;
            });
            for (let i = 0; i < psds.length; i++) {
                const element = psds[i];
                yield this.parsePsd(element, outDir);
            }
        });
    }
    parsePsd(psdPath, outDir) {
        return __awaiter(this, void 0, void 0, function* () {
            // 每开始一个新的 psd 清理掉上一个 psd 的图
            ImageMgr_1.imageMgr.clear();
            this.textObjects.length = 0;
            console.log(`=========================================`);
            console.log(`处理 ${psdPath} 文件`);
            let psdName = path_1.default.basename(psdPath, ".psd");
            let buffer = fs_extra_1.default.readFileSync(psdPath);
            const psdFile = psd.readPsd(buffer);
            let psdRoot = Parser_1.parser.parseLayer(psdFile);
            psdRoot.name = psdName;
            let prefabDir = path_1.default.join(outDir, psdName);
            let textureDir = path_1.default.join(prefabDir, "textures");
            fs_extra_1.default.mkdirsSync(prefabDir); // 创建预制体根目录
            fs_extra_1.default.emptyDirSync(prefabDir);
            fs_extra_1.default.mkdirsSync(textureDir); //创建 图片目录
            yield this.saveImage(textureDir);
            yield this.saveTextFile(psdRoot, prefabDir);
            console.log(`psd2ui ${psdPath} 处理完成`);
        });
    }
    saveImage(out) {
        let images = ImageMgr_1.imageMgr.getAllImage();
        let idx = 0;
        images.forEach((psdImage, k) => {
            // 查找镜像
            let _layer = ImageMgr_1.imageMgr.getSerialNumberImage(psdImage);
            let name = `${_layer.imgName}_${idx}`;
            console.log(`保存图片 [${_layer.imgName}] 重命名为 [${name}] md5: ${_layer.md5}`);
            let fullpath = path_1.default.join(out, `${name}.png`);
            fs_extra_1.default.writeFileSync(fullpath, _layer.imgBuffer);
            idx++;
        });
    }
    saveTextFile(psdRoot, out) {
        this.scanText(psdRoot, psdRoot);
        let textContent = JSON.stringify(this.textObjects, null, 2);
        let fullpath = path_1.default.join(out, `text.txt`);
        fs_extra_1.default.writeFileSync(fullpath, textContent, { encoding: "utf-8" });
    }
    scanText(layer, psdRoot) {
        if (layer instanceof PsdGroup_1.PsdGroup) {
            for (let i = 0; i < layer.children.length; i++) {
                const childLayer = layer.children[i];
                this.scanText(childLayer, psdRoot);
            }
        }
        else if (layer instanceof PsdText_1.PsdText) {
            let textObj = {
                text: layer.text,
                fontSize: layer.fontSize,
                color: `#${layer.color.toHEX()}`
            };
            // 有描边
            if (layer.outline) {
                textObj.outlineWidth = layer.outline.width;
                textObj.outlineColor = `#${layer.outline.color.toHEX()}`;
            }
            this.textObjects.push(textObj);
        }
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ExportImageMgr();
        }
        return this._instance;
    }
}
ExportImageMgr._instance = null;
exports.exportImageMgr = ExportImageMgr.getInstance();
