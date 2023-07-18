"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCProgressBar = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCComponent_1 = require("./CCComponent");
const CCSprite_1 = require("./CCSprite");
let CCProgressBar = class CCProgressBar extends CCComponent_1.CCComponent {
    constructor() {
        super(...arguments);
        // 2.4.x
        this._N$totalLength = 0;
        // 2.4.x
        this._N$barSprite = null;
        // 2.4.x
        this._N$mode = 0;
        // 2.4.x
        this._N$progress = 1;
        // 2.4.x
        this._N$reverse = false;
        // 3.4.x
        this._barSprite = null;
        // 3.4.x
        this._mode = 0;
        // 3.4.x
        this._totalLength = 0;
        // 3.4.x
        this._progress = 1;
        // 3.4.x
        this._reverse = false;
    }
    setBar(sprite) {
        this._barSprite = this._N$barSprite = {
            __id__: sprite.idx
        };
    }
    updateWithLayer(psdLayer) {
        if (!psdLayer.children) {
            console.error(`CCProgressBar-> 只能作用在 组图层 上`);
            return;
        }
        outer: for (let i = 0; i < psdLayer.children.length; i++) {
            const child = psdLayer.children[i];
            if (child.attr.comps.bar) {
                let node = child.uiObject;
                // 暂时只有横向进度条
                this._totalLength = this._N$totalLength = node._contentSize.width;
                for (let j = 0; j < node.components.length; j++) {
                    const comp = node.components[j];
                    if (comp instanceof CCSprite_1.CCSprite) {
                        this.setBar(comp);
                        break outer;
                    }
                }
            }
        }
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCProgressBar.prototype, "_N$totalLength", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCProgressBar.prototype, "_N$barSprite", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCProgressBar.prototype, "_N$mode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCProgressBar.prototype, "_N$progress", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCProgressBar.prototype, "_N$reverse", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCProgressBar.prototype, "_barSprite", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCProgressBar.prototype, "_mode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCProgressBar.prototype, "_totalLength", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCProgressBar.prototype, "_progress", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCProgressBar.prototype, "_reverse", void 0);
CCProgressBar = __decorate([
    (0, _decorator_1.cctype)("cc.ProgressBar")
], CCProgressBar);
exports.CCProgressBar = CCProgressBar;
