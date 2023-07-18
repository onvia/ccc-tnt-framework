"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCLabel = void 0;
const config_1 = require("../../config");
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCComponent_1 = require("./CCComponent");
const CCColor_1 = require("./values/CCColor");
let CCLabel = class CCLabel extends CCComponent_1.CCComponent {
    constructor() {
        super(...arguments);
        this._srcBlendFactor = 770; // 3.4.x = 2
        this._dstBlendFactor = 771; // 3.4.x = 4
        this._string = "";
        this._fontSize = 0;
        this._lineHeight = 0;
        this._enableWrapText = true;
        this._isSystemFontUsed = true;
        this._spacingX = 0;
        this._underlineHeight = 0;
        this._materials = [];
        // 2.4.x
        this._N$string = "";
        // 2.4.x
        this._N$file = null;
        // 2.4.x
        this._batchAsBitmap = false;
        // 2.4.x
        this._styleFlags = 0;
        // 2.4.x
        this._N$horizontalAlign = 1;
        // 2.4.x
        this._N$verticalAlign = 1;
        // 2.4.x
        this._N$fontFamily = "Arial";
        // 2.4.x
        this._N$overflow = 0;
        // 2.4.x
        this._N$cacheMode = 0;
        // 3.4.x
        this._visFlags = 0;
        // 3.4.x
        this._customMaterial = null;
        // 3.4.x
        this._color = new CCColor_1.CCColor(255, 255, 255, 255);
        // 3.4.x
        this._overflow = 0;
        // // 3.4.x
        this._cacheMode = 0;
        this._horizontalAlign = 1;
        this._verticalAlign = 1;
        this._actualFontSize = 0;
        this._isItalic = false;
        this._isBold = false;
        this._isUnderline = false;
    }
    updateWithLayer(psdLayer) {
        this._fontSize = psdLayer.fontSize;
        // this._actualFontSize = this._fontSize;
        this._string = this._N$string = psdLayer.text;
        this._lineHeight = this._fontSize + config_1.config.textLineHeightOffset;
        if (config_1.config.editorVersion >= EditorVersion_1.EditorVersion.v342) {
            this._srcBlendFactor = 2;
            this._dstBlendFactor = 4;
        }
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_srcBlendFactor", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_dstBlendFactor", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_string", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_fontSize", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_lineHeight", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_enableWrapText", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_isSystemFontUsed", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_spacingX", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCLabel.prototype, "_underlineHeight", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_materials", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$string", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$file", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_batchAsBitmap", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_styleFlags", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$horizontalAlign", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$verticalAlign", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$fontFamily", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$overflow", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCLabel.prototype, "_N$cacheMode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_visFlags", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_customMaterial", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_color", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_overflow", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_cacheMode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_horizontalAlign", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_verticalAlign", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_actualFontSize", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_isItalic", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_isBold", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCLabel.prototype, "_isUnderline", void 0);
CCLabel = __decorate([
    (0, _decorator_1.cctype)("cc.Label")
], CCLabel);
exports.CCLabel = CCLabel;
