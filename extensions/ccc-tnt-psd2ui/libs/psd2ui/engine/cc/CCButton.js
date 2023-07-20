"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCButton = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCComponent_1 = require("./CCComponent");
let CCButton = class CCButton extends CCComponent_1.CCComponent {
    constructor() {
        super(...arguments);
        // 2.4.x
        this.duration = 0.1;
        // 2.4.x
        this.zoomScale = 1.2;
        this.clickEvents = [];
        // 2.4.x
        this._N$interactable = true;
        // 2.4.x
        this._N$enableAutoGrayEffect = false;
        // 2.4.x
        this._N$transition = 3;
        // 2.4.x
        this.transition = 3;
        // 2.4.x
        this._N$target = null;
        // 3.4.x
        this._interactable = true;
        // 3.4.x
        this._transition = 3;
        // 3.4.x
        this._duration = 0.1;
        // 3.4.x
        this._zoomScale = 1.2;
        // 3.4.x
        this._target = null;
    }
    updateWithLayer(psdLayer) {
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "duration", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "zoomScale", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCButton.prototype, "clickEvents", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "_N$interactable", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "_N$enableAutoGrayEffect", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "_N$transition", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "transition", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCButton.prototype, "_N$target", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCButton.prototype, "_interactable", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCButton.prototype, "_transition", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCButton.prototype, "_duration", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCButton.prototype, "_zoomScale", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCButton.prototype, "_target", void 0);
CCButton = __decorate([
    (0, _decorator_1.cctype)("cc.Button")
], CCButton);
exports.CCButton = CCButton;
