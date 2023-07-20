"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCSprite = void 0;
const config_1 = require("../../config");
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCComponent_1 = require("./CCComponent");
const CCColor_1 = require("./values/CCColor");
const CCVec2_1 = require("./values/CCVec2");
let CCSprite = class CCSprite extends CCComponent_1.CCComponent {
    constructor() {
        super(...arguments);
        // 2.4.x
        this._materials = [];
        this._srcBlendFactor = 770; // 3.4.x = 2
        this._dstBlendFactor = 771; // 3.4.x = 4
        this._spriteFrame = null;
        this._type = 0;
        this._sizeMode = 1;
        this._fillType = 0;
        this._fillCenter = new CCVec2_1.CCVec2();
        this._fillStart = 0;
        this._fillRange = 0;
        this._isTrimmedMode = true;
        this._atlas = null;
        // 3.4.x
        this._visFlags = 0;
        // 3.4.x
        this._customMaterial = null;
        // 3.4.x
        this._color = new CCColor_1.CCColor(255, 255, 255, 255);
        // 3.4.x
        this._useGrayscale = false;
    }
    use9() {
        this._type = 1;
        this._sizeMode = 0;
    }
    updateWithLayer(psdLayer) {
        if (psdLayer.s9) {
            this.use9();
        }
        if (Math.abs(psdLayer.scale.x) != 1 || Math.abs(psdLayer.scale.y) != 1) {
            this._sizeMode = 0;
        }
        if (config_1.config.editorVersion >= EditorVersion_1.EditorVersion.v342) {
            this._srcBlendFactor = 2;
            this._dstBlendFactor = 4;
        }
    }
    setSpriteFrame(uuid) {
        if (config_1.config.editorVersion >= EditorVersion_1.EditorVersion.v342) {
            this._spriteFrame = { __uuid__: `${uuid}@f9941`, __expectedType__: "cc.SpriteFrame" };
        }
        else {
            this._spriteFrame = { __uuid__: uuid };
        }
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCSprite.prototype, "_materials", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_srcBlendFactor", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_dstBlendFactor", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_spriteFrame", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_type", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_sizeMode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_fillType", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_fillCenter", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_fillStart", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_fillRange", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_isTrimmedMode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCSprite.prototype, "_atlas", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCSprite.prototype, "_visFlags", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCSprite.prototype, "_customMaterial", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCSprite.prototype, "_color", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCSprite.prototype, "_useGrayscale", void 0);
CCSprite = __decorate([
    (0, _decorator_1.cctype)("cc.Sprite")
], CCSprite);
exports.CCSprite = CCSprite;
