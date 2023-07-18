"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsdLayer = void 0;
const Size_1 = require("../values/Size");
const Vec2_1 = require("../values/Vec2");
const Utils_1 = require("../utils/Utils");
const Rect_1 = require("../values/Rect");
const Color_1 = require("../values/Color");
const Vec3_1 = require("../values/Vec3");
class PsdLayer {
    constructor(source, parent, rootDoc) {
        var _a, _b, _c, _d;
        this.uuid = Utils_1.utils.uuid();
        this.source = source;
        this.parent = parent;
        this.rootDoc = rootDoc;
        this.name = source.name;
        this.position = new Vec2_1.Vec2();
        this.size = new Size_1.Size();
        this.rect = new Rect_1.Rect(source);
        // this.anchorPoint = new Vec2();
        this.anchorPoint = new Vec2_1.Vec2(0.5, 0.5);
        this.hidden = false;
        this.opacity = 255;
        this.color = new Color_1.Color(255, 255, 255, 255);
        console.log(`PsdLayer->解析到图层 `, this.name);
        this.attr = this.parseNameRule(this.name);
        // // 更新名字
        this.name = ((_a = this.attr) === null || _a === void 0 ? void 0 : _a.name) || this.name;
        // 使用配置的缩放系数
        let _scale = (_b = this.attr) === null || _b === void 0 ? void 0 : _b.comps.scale;
        this.scale = new Vec3_1.Vec3((_c = _scale === null || _scale === void 0 ? void 0 : _scale.x) !== null && _c !== void 0 ? _c : 1, (_d = _scale === null || _scale === void 0 ? void 0 : _scale.y) !== null && _d !== void 0 ? _d : 1, 1);
    }
    parseNameRule(name) {
        var _a, _b;
        if (!name) {
            return;
        }
        name = name.trim();
        let fragments = name.split("@");
        if (fragments.length === 0) {
            console.error(`PsdLayer-> 名字解析错误`);
            return;
        }
        let obj = {
            name: (_b = (_a = fragments[0]) === null || _a === void 0 ? void 0 : _a.replace(/\.|>|\/|\ /g, "_")) !== null && _b !== void 0 ? _b : "unknow",
            comps: {},
        };
        for (let i = 1; i < fragments.length; i++) {
            const fragment = fragments[i].trim();
            let attr = {};
            let startIdx = fragment.indexOf("{");
            let comp = fragment;
            if (startIdx != -1) {
                let endIdx = fragment.indexOf("}");
                if (endIdx == -1) {
                    console.log(`PsdLayer->${name} 属性 解析错误`);
                    continue;
                }
                let attrStr = fragment.substring(startIdx + 1, endIdx);
                comp = fragment.substr(0, startIdx);
                attrStr = attrStr.trim();
                let attrs = attrStr.split(",");
                attrs.forEach((str) => {
                    str = str.trim();
                    let strs = str.split(":");
                    if (!strs.length) {
                        console.log(`PsdLayer->${name} 属性 解析错误`);
                        return;
                    }
                    strs.map((v) => {
                        return v.trim();
                    });
                    attr[strs[0]] = Utils_1.utils.isNumber(strs[1]) ? parseFloat(strs[1]) : strs[1];
                });
            }
            comp = comp.trim();
            comp = comp.replace(":", ""); // 防呆，删除 key 中的冒号，
            obj.comps[comp] = attr;
        }
        // 获取别名的值
        obj.comps.ignore = obj.comps.ignore || obj.comps.ig;
        obj.comps.ignorenode = obj.comps.ignorenode || obj.comps.ignode;
        obj.comps.ignoreimg = obj.comps.ignoreimg || obj.comps.igimg;
        obj.comps.Btn = obj.comps.Btn || obj.comps.btn;
        obj.comps.ProgressBar = obj.comps.ProgressBar || obj.comps.progressBar;
        obj.comps.Toggle = obj.comps.Toggle || obj.comps.toggle;
        // obj.comps.position = obj.comps.position || obj.comps.pos;
        // 将mirror filpX filpY  进行合并
        if (obj.comps.flip || obj.comps.flipX || obj.comps.flipY) {
            obj.comps.flip = Object.assign({}, obj.comps.flip, obj.comps.flipX, obj.comps.flipY);
            if (obj.comps.flipX) {
                obj.comps.flip.x = 1;
            }
            if (obj.comps.flipY) {
                obj.comps.flip.y = 1;
            }
            //   x,y 都缺省时，默认 x 方向镜像
            if (typeof obj.comps.flip.bind !== 'undefined') {
                if (!obj.comps.flip.y) {
                    obj.comps.flip.x = 1;
                }
                // 只有作为镜像图片使用的时候才反向赋值
                // 反向赋值，防止使用的时候值错误
                if (obj.comps.flip.x) {
                    obj.comps.flipX = Object.assign({}, obj.comps.flipX, obj.comps.flip);
                }
                if (obj.comps.flip.y) {
                    obj.comps.flipY = Object.assign({}, obj.comps.flipY, obj.comps.flip);
                }
            }
        }
        // 检查冲突
        if (obj.comps.full && obj.comps.size) {
            console.warn(`PsdLayer->${obj.name} 同时存在 @full 和 @size`);
        }
        return obj;
    }
    /** 解析数据 */
    parseSource() {
        var _a, _b;
        let _source = this.source;
        // psd文档
        if (!this.parent) {
            return false;
        }
        this.hidden = _source.hidden;
        this.opacity = Math.round(_source.opacity * 255);
        // 获取锚点
        let ar = this.attr.comps.ar;
        if (ar) {
            this.anchorPoint.x = (_a = ar.x) !== null && _a !== void 0 ? _a : this.anchorPoint.x;
            this.anchorPoint.y = (_b = ar.y) !== null && _b !== void 0 ? _b : this.anchorPoint.y;
        }
        this.computeBasePosition();
        return true;
    }
    /** 解析 effect */
    parseEffects() {
        // 颜色叠加 暂时搞不定
        // if(this.source.effects?.solidFill){
        //     let solidFills = this.source.effects?.solidFill;
        //     for (let i = 0; i < solidFills.length; i++) {
        //         const solidFill = solidFills[i];
        //         if(solidFill.enabled){
        //             let color = solidFill.color;
        //             this.color = new Color(color.r,color.g,color.b,solidFill.opacity * 255);
        //         }
        //     }
        // }
    }
    // 计算初始坐标 左下角 0,0 为锚点
    computeBasePosition() {
        if (!this.rootDoc) {
            return;
        }
        let _rect = this.rect;
        let width = (_rect.right - _rect.left);
        let height = (_rect.bottom - _rect.top);
        this.size.width = width;
        this.size.height = height;
        // 位置 左下角为锚点
        let x = _rect.left;
        let y = (this.rootDoc.size.height - _rect.bottom);
        this.position.x = x;
        this.position.y = y;
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
        this.position.x = this.position.x - this.rootDoc.size.width * this.rootDoc.anchorPoint.x + this.size.width * this.anchorPoint.x;
        this.position.y = this.position.y - this.rootDoc.size.height * this.rootDoc.anchorPoint.y + this.size.height * this.anchorPoint.y;
    }
}
exports.PsdLayer = PsdLayer;
