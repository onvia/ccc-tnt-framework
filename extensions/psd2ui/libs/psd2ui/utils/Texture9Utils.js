"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Texture9Utils = void 0;
const canvas_1 = __importDefault(require("canvas"));
class Texture9Utils {
    static safeBorder(border) {
        border.l = border.l || border.r || 0;
        border.r = border.r || border.l || 0;
        border.t = border.t || border.b || 0;
        border.b = border.b || border.t || 0;
        return border;
    }
    static split(_canvas, border) {
        this.safeBorder(border);
        let cw = _canvas.width;
        let ch = _canvas.height;
        let left = border.l || cw;
        let right = border.r || cw;
        let top = border.t || ch;
        let bottom = border.b || ch;
        let newCanvas = canvas_1.default.createCanvas((border.l + border.r) || cw, (border.b + border.t) || ch);
        let ctx = newCanvas.getContext("2d");
        // 左上
        ctx.drawImage(_canvas, 0, 0, left, top, 0, 0, left, top);
        // 左下
        ctx.drawImage(_canvas, 0, ch - top, left, bottom, 0, top, left, bottom);
        // 右上
        ctx.drawImage(_canvas, cw - left, 0, right, top, left, 0, right, top);
        // 右下
        ctx.drawImage(_canvas, cw - left, ch - top, right, bottom, left, top, right, bottom);
        return newCanvas;
    }
}
exports.Texture9Utils = Texture9Utils;
