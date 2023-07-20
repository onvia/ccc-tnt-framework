"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCLabelOutline = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCComponent_1 = require("./CCComponent");
const CCColor_1 = require("./values/CCColor");
let CCLabelOutline = class CCLabelOutline extends CCComponent_1.CCComponent {
    constructor() {
        super(...arguments);
        this._color = new CCColor_1.CCColor(255, 255, 255, 255);
        this._width = 1;
    }
    updateWithLayer(psdLayer) {
        this._width = psdLayer.outline.width;
        this._color.set(psdLayer.outline.color);
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabelOutline.prototype, "_color", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabelOutline.prototype, "_width", void 0);
CCLabelOutline = __decorate([
    (0, _decorator_1.cctype)("cc.LabelOutline")
], CCLabelOutline);
exports.CCLabelOutline = CCLabelOutline;
