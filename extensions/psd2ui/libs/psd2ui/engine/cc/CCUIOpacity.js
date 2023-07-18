"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCUIOpacity = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCComponent_1 = require("./CCComponent");
// 3.4.x
let CCUIOpacity = class CCUIOpacity extends CCComponent_1.CCComponent {
    constructor() {
        super(...arguments);
        this._opacity = 255;
    }
    updateWithLayer(psdLayer) {
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCUIOpacity.prototype, "_opacity", void 0);
CCUIOpacity = __decorate([
    (0, _decorator_1.cctype)("cc.UIOpacity")
], CCUIOpacity);
exports.CCUIOpacity = CCUIOpacity;
