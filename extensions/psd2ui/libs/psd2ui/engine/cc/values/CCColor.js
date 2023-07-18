"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCColor = void 0;
const Color_1 = require("../../../values/Color");
class CCColor extends Color_1.Color {
    constructor() {
        super(...arguments);
        this.__type__ = "cc.Color";
    }
}
exports.CCColor = CCColor;
