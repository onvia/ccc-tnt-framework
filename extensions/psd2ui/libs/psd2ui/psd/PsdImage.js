"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsdImage = void 0;
const PsdLayer_1 = require("./PsdLayer");
const Utils_1 = require("../utils/Utils");
const Texture9Utils_1 = require("../utils/Texture9Utils");
const Size_1 = require("../values/Size");
const FileUtils_1 = require("../utils/FileUtils");
const Vec3_1 = require("../values/Vec3");
class PsdImage extends PsdLayer_1.PsdLayer {
    constructor(source, parent, rootDoc) {
        var _a;
        super(source, parent, rootDoc);
        this.textureUuid = Utils_1.utils.uuid();
        // img name
        this.imgName = ((_a = this.attr.comps.img) === null || _a === void 0 ? void 0 : _a.name) || this.name;
        // .9
        if (this.attr.comps['.9']) {
            let s9 = this.attr.comps['.9'];
            this.s9 = Texture9Utils_1.Texture9Utils.safeBorder(s9);
            let newCanvas = Texture9Utils_1.Texture9Utils.split(this.source.canvas, s9);
            this.source.canvas = newCanvas;
        }
        let canvas = this.source.canvas;
        this.imgBuffer = canvas.toBuffer('image/png');
        this.md5 = FileUtils_1.fileUtils.getMD5(this.imgBuffer);
        this.textureSize = new Size_1.Size(canvas.width, canvas.height);
        this.scale = new Vec3_1.Vec3((this.isFilpX() ? -1 : 1) * this.scale.x, (this.isFilpY() ? -1 : 1) * this.scale.y, 1);
    }
    onCtor() {
    }
    isIgnore() {
        // 
        if (this.attr.comps.ignore || this.attr.comps.ignoreimg) {
            return true;
        }
        return false;
    }
    /** 是否是镜像图片 */
    isBind() {
        var _a, _b;
        return typeof ((_a = this.attr.comps.flip) === null || _a === void 0 ? void 0 : _a.bind) !== 'undefined'
            || typeof ((_b = this.attr.comps.img) === null || _b === void 0 ? void 0 : _b.bind) !== 'undefined';
    }
    /** 是否是 x 方向镜像图片 */
    isFilpX() {
        var _a;
        return typeof ((_a = this.attr.comps.flipX) === null || _a === void 0 ? void 0 : _a.bind) !== 'undefined';
    }
    /** 是否是 y 方向镜像图片 */
    isFilpY() {
        var _a;
        return typeof ((_a = this.attr.comps.flipY) === null || _a === void 0 ? void 0 : _a.bind) !== 'undefined';
    }
    // 根据锚点计算坐标
    updatePositionWithAR() {
        if (!this.parent) {
            return;
        }
        let parent = this.parent;
        while (parent) {
            this.position.x -= parent.position.x;
            this.position.y -= parent.position.y;
            parent = parent.parent;
        }
        // this.position.x  = this.position.x - this.parent.size.width * this.parent.anchorPoint.x + this.size.width * this.anchorPoint.x;
        // this.position.y  = this.position.y - this.parent.size.height * this.parent.anchorPoint.y + this.size.height * this.anchorPoint.y;
        // 如果是镜像图片，则特殊处理
        let arX = (this.isFilpX() ? (1 - this.anchorPoint.x) : this.anchorPoint.x);
        let arY = (this.isFilpY() ? (1 - this.anchorPoint.y) : this.anchorPoint.y);
        this.position.x = this.position.x - this.rootDoc.size.width * this.rootDoc.anchorPoint.x + this.size.width * arX;
        this.position.y = this.position.y - this.rootDoc.size.height * this.rootDoc.anchorPoint.y + this.size.height * arY;
    }
}
exports.PsdImage = PsdImage;
