"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
class Rect {
    constructor(left = 0, right = 0, top = 0, bottom = 0) {
        if (typeof left == 'object') {
            this.set(left);
            return;
        }
        this.left = left || 0;
        this.right = right || 0;
        this.top = top || 0;
        this.bottom = bottom || 0;
    }
    set(rect) {
        this.left = rect.left;
        this.right = rect.right;
        this.top = rect.top;
        this.bottom = rect.bottom;
    }
}
exports.Rect = Rect;
