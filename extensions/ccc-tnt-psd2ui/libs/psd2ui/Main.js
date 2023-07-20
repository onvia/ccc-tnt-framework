"use strict";
//ag-psd 使用 参考 https://github.com/Agamnentzar/ag-psd/blob/HEAD/README_PSD.md
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
exports.Main = void 0;
require("ag-psd/initialize-canvas"); // only needed for reading image data and thumbnails
const psd = __importStar(require("ag-psd"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Parser_1 = require("./Parser");
const PsdGroup_1 = require("./psd/PsdGroup");
const CCNode_1 = require("./engine/cc/CCNode");
const PsdImage_1 = require("./psd/PsdImage");
const PsdText_1 = require("./psd/PsdText");
const CCSprite_1 = require("./engine/cc/CCSprite");
const CCPrefabInfo_1 = require("./engine/cc/CCPrefabInfo");
const CCPrefab_1 = require("./engine/cc/CCPrefab");
const CCSize_1 = require("./engine/cc/values/CCSize");
const CCVec2_1 = require("./engine/cc/values/CCVec2");
const CCLabel_1 = require("./engine/cc/CCLabel");
const CCLabelOutline_1 = require("./engine/cc/CCLabelOutline");
const ImageCacheMgr_1 = require("./assets-manager/ImageCacheMgr");
const EditorVersion_1 = require("./EditorVersion");
const config_1 = require("./config");
const FileUtils_1 = require("./utils/FileUtils");
const ImageMgr_1 = require("./assets-manager/ImageMgr");
const ExportImageMgr_1 = require("./ExportImageMgr");
const CCUIOpacity_1 = require("./engine/cc/CCUIOpacity");
const CCUITransform_1 = require("./engine/cc/CCUITransform");
const CCVec3_1 = require("./engine/cc/values/CCVec3");
/***
 * 执行流程
 * - 首次运行，先读取项目文件夹下所有图片资源，进行 md5 缓存
 *
 * - 加载缓存文件
 * - 处理 psd
 * - 通过 md5 判断是否已经存在资源，如果存在， 则不再导出，预制体中使用已存在的资源的 uuid
 *
 */
console.log(`当前目录： `, __dirname);
class Main {
    constructor() {
        this.spriteFrameMetaContent = "";
        this.prefabMetaContent = "";
        this.psdConfig = null;
        // 强制导出图片
        this.isForceImg = false;
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            // config.editorVersion = EditorVersion.v342;
            // // 首次运行需要读取所有图片
            // await imageCacheMgr.loadImages("E:\\Demo\\CC249JSTest\\assets");
            // // await imageCacheMgr.loadImages("E:\\YQ\\Code\\trunk\\assets");
            // await imageCacheMgr.saveImageMap("E:\\Git\\ccc-framework-3d\\tools\\psd2ui\\cache\\cache.json");
            const outDir = path_1.default.join(__dirname, "..", "out");
            // // 加载测试配置
            this.loadPsdConfig(path_1.default.join(__dirname, "../test/test.config.json"));
            // // 首先加载缓存文件
            yield ImageCacheMgr_1.imageCacheMgr.initWithPath("E:\\Git\\ccc-framework-3d\\tools\\psd2ui\\cache\\cache.json");
            yield this.loadMetaTemplete();
            let psdPath = "./test/demo.psd";
            // // let psdPath = "E:\\YQ\\Meishu\\D_巅峰对决\\竞猜\\guild_PeakBetMainWindow.psd"
            // psdPath = "./test/对战动画-切.psd";
            // psdPath = "./test/test.psd";
            this.parsePsd(psdPath, outDir);
            // let psdPath = "./test";
            // let psdPath = "E:\\YQ\\Meishu\\D_巅峰对决\\竞猜\\guild_PeakBetMainWindow.psd"
            // psdPath = "./test/test.psd";
            // this.parsePsdDir(psdPath, outDir);
            yield ImageCacheMgr_1.imageCacheMgr.saveImageMap();
            console.log(`psd2ui 导出完成`);
        });
    }
    // 首先加载 meta 模板
    loadMetaTemplete() {
        return __awaiter(this, void 0, void 0, function* () {
            this.spriteFrameMetaContent = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, `../assets/cc/meta/CCSpriteFrame.meta.${EditorVersion_1.EditorVersion[config_1.config.editorVersion]}`), "utf-8");
            this.prefabMetaContent = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, `../assets/cc/meta/CCPrefab.meta.${EditorVersion_1.EditorVersion[config_1.config.editorVersion]}`), "utf-8");
        });
    }
    // 加载配置
    loadPsdConfig(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs_extra_1.default.existsSync(filepath)) {
                console.log(`Main-> 配置 ${filepath} 不存在`);
                return;
            }
            console.log(`Main-> 读取配置 ${filepath}`);
            let psdConfig = fs_extra_1.default.readFileSync(filepath, "utf-8");
            this.psdConfig = JSON.parse(psdConfig);
            // // 合并 文本偏移配置
            // if (this.psdConfig.textOffsetY) {
            //     config.textOffsetY = Object.assign({}, config.textOffsetY, this.psdConfig.textOffsetY);
            // }
            // // 合并 行高配置
            // if (this.psdConfig.textLineHeightOffset) {
            //     config.textLineHeightOffset = Object.assign({}, config.textLineHeightOffset, this.psdConfig.textLineHeightOffset);
            // }
            // 合并配置
            for (const key in this.psdConfig) {
                if (key in config_1.config) {
                    if (typeof this.psdConfig[key] === 'object') {
                        config_1.config[key] = Object.assign({}, config_1.config[key], this.psdConfig[key]);
                    }
                    else {
                        config_1.config[key] = this.psdConfig[key] || config_1.config[key];
                    }
                }
            }
            // console.log(`Main-> `, JSON.stringify(config_1.config, null, 2));
        });
    }
    exec(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args = mergeAlias(args);
            if (args.help) {
                console.log(`help:\n`, config_1.config.help);
                return false;
            }
            // 只导出图片
            if (args["img-only"]) {
                ExportImageMgr_1.exportImageMgr.exec(args);
                return true;
            }
            let writeCache = () => __awaiter(this, void 0, void 0, function* () {
                // 写入缓存
                if (args.cache) {
                    fs_extra_1.default.mkdirsSync(path_1.default.dirname(args.cache));
                    yield ImageCacheMgr_1.imageCacheMgr.saveImageMap(args.cache);
                }
            });
            // 设置引擎版本
            if (args["engine-version"]) {
                config_1.config.editorVersion = EditorVersion_1.EditorVersion[args["engine-version"]];
            }
            if (args.init && (!args["project-assets"] || !args.cache)) {
                console.log(`psd2ui --init 无法处理，请设置 --project-assets`);
                return;
            }
            // 在没有缓存文件或者 指定重新缓存的时候，读取项目资源
            if (args["project-assets"] && (!fs_extra_1.default.existsSync(args.cache) || args["cache-remake"] || args.init)) {
                yield ImageCacheMgr_1.imageCacheMgr.loadImages(args["project-assets"]);
                // 先写入一次
                writeCache();
                if (args.init) {
                    console.log(`psd2ui 缓存完成`);
                    return;
                }
            }
            // 检查参数
            if (!this.checkArgs(args)) {
                return;
            }
            if (args.cache) {
                yield ImageCacheMgr_1.imageCacheMgr.initWithPath(args.cache);
            }
            // 加载 meta 文件模板
            yield this.loadMetaTemplete();
            if (args.config) {
                yield this.loadPsdConfig(args.config);
            }
            this.isForceImg = !!args["force-img"];
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
            // 写入缓存
            yield writeCache();
            console.log(`psd2ui 导出完成`);
        });
    }
    // 检查参数
    checkArgs(args) {
        if (!args.input) {
            console.error(`请设置 --input`);
            return false;
        }
        // 没有输出目录的时候用 输入目录
        // if (!args.output) {
        //     console.error(`请设置 --output`);
        //     return false;
        // }
        if (!fs_extra_1.default.existsSync(args.input)) {
            console.error(`输入路径不存在: ${args.input}`);
            return false;
        }
        if (args["engine-version"]) {
            let editorVersion = EditorVersion_1.EditorVersion[args["engine-version"]];
            switch (editorVersion) {
                case EditorVersion_1.EditorVersion.v249:
                case EditorVersion_1.EditorVersion.v342:
                    break;
                default:
                    console.log(`暂未实现该引擎版本 ${args["engine-version"]}`);
                    return false;
            }
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
            yield this.buildPrefab(psdRoot);
            yield this.savePrefab(psdRoot, prefabDir);
            console.log(`psd2ui ${psdPath} 处理完成`);
        });
    }
    buildPrefab(psdRoot) {
        let prefab = new CCPrefab_1.CCPrefab();
        psdRoot.pushObject(prefab);
        let data = this.createCCNode(psdRoot, psdRoot);
        prefab.data = { __id__: data.idx };
        // 后期处理
        this.postUIObject(psdRoot, psdRoot);
    }
    createCCNode(layer, psdRoot) {
        var _a, _b, _c, _d;
        let node = new CCNode_1.CCNode(psdRoot);
        layer.uiObject = node;
        node._name = ((_a = layer.attr) === null || _a === void 0 ? void 0 : _a.name) || layer.name;
        node._active = !layer.hidden;
        node._opacity = layer.opacity;
        if (config_1.config.editorVersion >= EditorVersion_1.EditorVersion.v342) {
            // 3.4.x
            if (layer.opacity !== 255) {
                let uiOpacity = new CCUIOpacity_1.CCUIOpacity();
                uiOpacity._opacity = layer.opacity;
                uiOpacity.updateWithLayer(layer);
                node.addComponent(uiOpacity);
            }
        }
        // 劫持尺寸设置，使用 psd 中配置的尺寸，这里不对原数据进行修改
        let size = new CCSize_1.CCSize(layer.size.width, layer.size.height);
        if ((_b = layer.attr) === null || _b === void 0 ? void 0 : _b.comps.size) {
            let _attrSize = layer.attr.comps.size;
            size.width = (_c = _attrSize.w) !== null && _c !== void 0 ? _c : size.width;
            size.height = (_d = _attrSize.h) !== null && _d !== void 0 ? _d : size.height;
        }
        // 对缩放进行处理
        size.width = Math.round(Math.abs(size.width / layer.scale.x));
        size.height = Math.round(Math.abs(size.height / layer.scale.y));
        // 配置的位置 Y 偏移
        let offsetY = 0;
        if (layer instanceof PsdText_1.PsdText) {
            offsetY = layer.offsetY;
        }
        node._contentSize = size;
        // 更新一下位置 // 根据图层名字设置 锚点，位置， 因为没有对原始数据进行修改，所以这里不考虑 缩放
        layer.updatePositionWithAR();
        // 2.4.9
        node._trs.setPosition(layer.position.x, layer.position.y + offsetY, 0);
        node._trs.setRotation(0, 0, 0, 1);
        node._trs.setScale(layer.scale.x, layer.scale.y, layer.scale.z);
        node._anchorPoint = new CCVec2_1.CCVec2(layer.anchorPoint.x, layer.anchorPoint.y);
        if (config_1.config.editorVersion >= EditorVersion_1.EditorVersion.v342) {
            // 3.4.x
            node._lpos = new CCVec3_1.CCVec3(layer.position.x, layer.position.y + offsetY, 0);
            node._lrot = new CCVec3_1.CCVec3(0, 0, 0);
            node._lscale = new CCVec3_1.CCVec3(layer.scale.x, layer.scale.y, layer.scale.z);
            node._euler = new CCVec3_1.CCVec3();
            // 3.4.x
            let uiTransform = new CCUITransform_1.CCUITransform();
            uiTransform._contentSize = size;
            uiTransform._anchorPoint = node._anchorPoint;
            uiTransform.updateWithLayer(layer);
            node.addComponent(uiTransform);
        }
        // 
        if (layer instanceof PsdGroup_1.PsdGroup) {
            for (let i = 0; i < layer.children.length; i++) {
                const childLayer = layer.children[i];
                let childNode = this.createCCNode(childLayer, psdRoot);
                childNode && node.addChild(childNode);
            }
        }
        else if (layer instanceof PsdImage_1.PsdImage) {
            let sprite = new CCSprite_1.CCSprite();
            node.addComponent(sprite);
            sprite._materials.push({
                __uuid__: config_1.config.SpriteFrame_Material
            });
            sprite.updateWithLayer(layer);
            if (layer.isIgnore()) {
                // 忽略图像
            }
            else {
                // 查找绑定的图像
                let _layer = ImageMgr_1.imageMgr.getSerialNumberImage(layer);
                // 使用已缓存的 图片 的 uuid
                let imageWarp = ImageCacheMgr_1.imageCacheMgr.get(_layer.md5);
                sprite.setSpriteFrame(imageWarp ? imageWarp.textureUuid : _layer.textureUuid);
            }
            this.applyConfig(sprite);
        }
        else if (layer instanceof PsdText_1.PsdText) {
            let label = new CCLabel_1.CCLabel();
            node.addComponent(label);
            node._color.set(layer.color);
            label._color.set(layer.color);
            label._materials.push({
                __uuid__: config_1.config.Label_Material
            });
            label.updateWithLayer(layer);
            this.applyConfig(label);
            // 有描边
            if (layer.outline) {
                let labelOutline = new CCLabelOutline_1.CCLabelOutline();
                node.addComponent(labelOutline);
                labelOutline.updateWithLayer(layer);
                this.applyConfig(labelOutline);
            }
        }
        // Button / Toggle / ProgressBar
        if (layer.attr) {
            for (const key in layer.attr.comps) {
                if (Object.prototype.hasOwnProperty.call(layer.attr.comps, key) && layer.attr.comps[key]) {
                    let ctor = config_1.config.CompMippings[key];
                    if (ctor) {
                        let comp = new ctor();
                        node.addComponent(comp);
                        comp.updateWithLayer(layer);
                        this.applyConfig(comp);
                    }
                }
            }
        }
        this.createPrefabInfo(layer, psdRoot);
        return node;
    }
    createPrefabInfo(layer, psdRoot) {
        let node = layer.uiObject;
        let prefabInfo = new CCPrefabInfo_1.CCPrefabInfo();
        let idx = psdRoot.pushObject(prefabInfo);
        node._prefab = { __id__: idx };
    }
    // 后处理
    postUIObject(layer, psdRoot) {
    }
    saveImage(out) {
        let images = ImageMgr_1.imageMgr.getAllImage();
        images.forEach((psdImage, k) => {
            // 查找镜像
            let _layer = ImageMgr_1.imageMgr.getSerialNumberImage(psdImage);
            // 查找已缓存的相同图像
            let imageWarp = ImageCacheMgr_1.imageCacheMgr.get(_layer.md5);
            // 不是强制导出的话，判断是否已经导出过
            if (!this.isForceImg) {
                // 判断是否已经导出过相同 md5 的资源，不再重复导出
                if (imageWarp === null || imageWarp === void 0 ? void 0 : imageWarp.isOutput) {
                    console.log(`已有相同资源，不再导出 [${psdImage.imgName}]  md5: ${psdImage.md5}`);
                    return;
                }
            }
            console.log(`保存图片 [${_layer.imgName}] md5: ${_layer.md5}`);
            imageWarp && (imageWarp.isOutput = true);
            let fullpath = path_1.default.join(out, `${_layer.imgName}.png`);
            fs_extra_1.default.writeFileSync(fullpath, _layer.imgBuffer);
            this.saveImageMeta(_layer, fullpath);
        });
    }
    saveImageMeta(layer, fullpath) {
        let _layer = ImageMgr_1.imageMgr.getSerialNumberImage(layer);
        let imageWarp = ImageCacheMgr_1.imageCacheMgr.get(_layer.md5);
        if (!imageWarp) {
            imageWarp = _layer;
        }
        // 2.4.9
        let meta = this.spriteFrameMetaContent.replace(/\$SPRITE_FRAME_UUID/g, imageWarp.uuid);
        meta = meta.replace(/\$TEXTURE_UUID/g, imageWarp.textureUuid);
        meta = meta.replace(/\$FILE_NAME/g, _layer.imgName);
        meta = meta.replace(/\$WIDTH/g, _layer.textureSize.width);
        meta = meta.replace(/\$HEIGHT/g, _layer.textureSize.height);
        let s9 = _layer.s9 || {
            b: 0, t: 0, l: 0, r: 0,
        };
        meta = meta.replace(/\$BORDER_TOP/g, s9.t);
        meta = meta.replace(/\$BORDER_BOTTOM/g, s9.b);
        meta = meta.replace(/\$BORDER_LEFT/g, s9.l);
        meta = meta.replace(/\$BORDER_RIGHT/g, s9.r);
        fs_extra_1.default.writeFileSync(fullpath + `.meta`, meta);
    }
    savePrefab(psdDoc, out) {
        let fullpath = path_1.default.join(out, `${psdDoc.name}.prefab`);
        fs_extra_1.default.writeFileSync(fullpath, JSON.stringify(psdDoc.objectArray, null, 2));
        this.savePrefabMeta(psdDoc, fullpath);
    }
    savePrefabMeta(psdDoc, fullpath) {
        let meta = this.prefabMetaContent.replace(/\$PREFB_UUID/g, psdDoc.uuid);
        fs_extra_1.default.writeFileSync(fullpath + `.meta`, meta);
    }
    applyConfig(comp) {
        if (!this.psdConfig) {
            return;
        }
        if (comp.__type__ in this.psdConfig) {
            let compConfig = this.psdConfig[comp.__type__];
            for (const key in compConfig) {
                if (Object.prototype.hasOwnProperty.call(compConfig, key)) {
                    const element = compConfig[key];
                    comp[key] = element;
                }
            }
        }
    }
}
exports.Main = Main;
/** 合并别名 */
function mergeAlias(args) {
    // 如果是 json 对象参数
    if (args.json) {
        let base64 = args.json;
        // 解码 json 
        args = JSON.parse(Buffer.from(base64, "base64").toString());
        // // 编码
        // let jsonContent = JSON.stringify(args);
        // let base64 = Buffer.from(jsonContent).toString("base64");
    }
    args.help = args.help || args.h;
    args.input = args.input || args.in;
    args.output = args.output || args.out;
    args["engine-version"] = args["engine-version"] || args.ev;
    args["project-assets"] = args["project-assets"] || args.p;
    args["cache-remake"] = args["cache-remake"] || args.crm;
    args["force-img"] = args["force-img"] || args.fimg;
    args.cache = args.cache || args.c;
    args.init = args.init || args.i;
    args.config = args.config;
    return args;
}
