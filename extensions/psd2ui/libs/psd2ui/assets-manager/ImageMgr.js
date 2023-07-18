"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageMgr = void 0;
class ImageMgr {
    constructor() {
        // 镜像图像管理
        this._imageIdKeyMap = new Map();
        // 当前 psd 所有的图片
        this._imageArray = new Map();
    }
    add(psdImage) {
        var _a;
        // 不忽略导出图片
        if (!psdImage.isIgnore() && !psdImage.isBind()) {
            if (!this._imageArray.has(psdImage.md5)) {
                this._imageArray.set(psdImage.md5, psdImage);
            }
        }
        if (typeof ((_a = psdImage.attr.comps.img) === null || _a === void 0 ? void 0 : _a.id) != "undefined") {
            let id = psdImage.attr.comps.img.id;
            if (this._imageIdKeyMap.has(id)) {
                console.warn(`ImageMgr-> ${psdImage.source.name} 已有相同 @img{id:${id}}，请检查 psd 图层`);
            }
            this._imageIdKeyMap.set(id, psdImage);
        }
    }
    getAllImage() {
        return this._imageArray;
    }
    /** 尝试获取有编号的图像图层 */
    getSerialNumberImage(psdImage) {
        var _a, _b, _c;
        let bind = (_b = (_a = psdImage.attr.comps.flip) === null || _a === void 0 ? void 0 : _a.bind) !== null && _b !== void 0 ? _b : (_c = psdImage.attr.comps.img) === null || _c === void 0 ? void 0 : _c.bind;
        if (typeof bind != 'undefined') {
            if (this._imageIdKeyMap.has(bind)) {
                return this._imageIdKeyMap.get(bind);
            }
            else {
                console.warn(`ImageMgr-> ${psdImage.source.name} 未找到绑定的图像 {${bind}}，请检查 psd 图层`);
            }
        }
        return psdImage;
    }
    clear() {
        this._imageIdKeyMap.clear();
        this._imageArray.clear();
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ImageMgr();
        }
        return this._instance;
    }
}
ImageMgr._instance = null;
exports.imageMgr = ImageMgr.getInstance();
