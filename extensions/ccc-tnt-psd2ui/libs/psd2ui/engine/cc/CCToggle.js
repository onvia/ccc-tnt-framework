"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCToggle = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCButton_1 = require("./CCButton");
const CCSprite_1 = require("./CCSprite");
let CCToggle = class CCToggle extends CCButton_1.CCButton {
    constructor() {
        super(...arguments);
        // 2.4.x
        this._N$isChecked = true;
        // 2.4.x
        this.toggleGroup = null;
        // 2.4.x
        this.checkMark = null;
        this.checkEvents = [];
        // 3.4.x
        this._isChecked = true;
        // 3.4.x
        this._checkMark = null;
    }
    setCheckMark(sprite) {
        this._checkMark = this.checkMark = {
            __id__: sprite.idx
        };
    }
    updateWithLayer(psdLayer) {
        if (!psdLayer.children) {
            console.error(`CCToggle-> 只能作用在 组图层 上`);
            return;
        }
        outer: for (let i = 0; i < psdLayer.children.length; i++) {
            const child = psdLayer.children[i];
            if (child.attr.comps.check) {
                let node = child.uiObject;
                for (let j = 0; j < node.components.length; j++) {
                    const comp = node.components[j];
                    if (comp instanceof CCSprite_1.CCSprite) {
                        this.setCheckMark(comp);
                        break outer;
                    }
                }
            }
        }
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCToggle.prototype, "_N$isChecked", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCToggle.prototype, "toggleGroup", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCToggle.prototype, "checkMark", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCToggle.prototype, "checkEvents", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCToggle.prototype, "_isChecked", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCToggle.prototype, "_checkMark", void 0);
CCToggle = __decorate([
    (0, _decorator_1.cctype)("cc.Toggle")
], CCToggle);
exports.CCToggle = CCToggle;
