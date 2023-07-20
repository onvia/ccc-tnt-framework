"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsdGroup = void 0;
const Rect_1 = require("../values/Rect");
const PsdLayer_1 = require("./PsdLayer");
class PsdGroup extends PsdLayer_1.PsdLayer {
    constructor(source, parent, rootDoc) {
        super(source, parent, rootDoc);
        this.children = [];
        if (rootDoc) {
            this.rect = new Rect_1.Rect(0, rootDoc.size.width, 0, rootDoc.size.height);
        }
    }
    parseSource() {
        var _a;
        super.parseSource();
        if (!((_a = this.attr) === null || _a === void 0 ? void 0 : _a.comps.full)) {
            this.resize();
            this.computeBasePosition();
        }
        return true;
    }
    resize() {
        let left = Number.MAX_SAFE_INTEGER;
        let right = Number.MIN_SAFE_INTEGER;
        let top = Number.MAX_SAFE_INTEGER;
        let bottom = Number.MIN_SAFE_INTEGER;
        for (let i = 0; i < this.children.length; i++) {
            const element = this.children[i];
            let _rect = element.rect;
            left = Math.min(_rect.left, left);
            right = Math.max(_rect.right, right);
            top = Math.min(_rect.top, top);
            bottom = Math.max(_rect.bottom, bottom);
        }
        this.rect.left = left;
        this.rect.right = right;
        this.rect.top = top;
        this.rect.bottom = bottom;
    }
    onCtor() {
    }
}
exports.PsdGroup = PsdGroup;
