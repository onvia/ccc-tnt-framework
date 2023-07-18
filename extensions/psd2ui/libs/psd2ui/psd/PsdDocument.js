"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsdDocument = void 0;
const Rect_1 = require("../values/Rect");
const Size_1 = require("../values/Size");
const PsdGroup_1 = require("./PsdGroup");
class PsdDocument extends PsdGroup_1.PsdGroup {
    constructor(source) {
        super(source, null, null);
        /** 当前文档所有的图片 */
        this.images = new Map();
        this.objectMap = new Map();
        this.objectArray = [];
        this.size = new Size_1.Size(source.width, source.height);
        this.rect = new Rect_1.Rect(0, this.size.width, 0, this.size.height);
    }
    pushObject(uiObject) {
        let idx = this.objectArray.length;
        uiObject.idx = idx;
        this.objectMap.set(uiObject.uuid, idx);
        this.objectArray.push(uiObject);
        return idx;
    }
    getObjectIdx(uuid) {
        let idx = this.objectMap.get(uuid);
        return idx;
    }
    getObject(uuid) {
        let idx = this.objectMap.get(uuid);
        if (idx < this.objectArray.length) {
            return this.objectArray[idx];
        }
        return null;
    }
    onCtor() {
        super.onCtor();
    }
}
exports.PsdDocument = PsdDocument;
