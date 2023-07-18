"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCVec3 = void 0;
const Vec3_1 = require("../../../values/Vec3");
class CCVec3 extends Vec3_1.Vec3 {
    constructor() {
        super(...arguments);
        this.__type__ = "cc.Vec3";
    }
}
exports.CCVec3 = CCVec3;
