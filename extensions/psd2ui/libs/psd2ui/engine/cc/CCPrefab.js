"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCPrefab = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCObject_1 = require("./CCObject");
let CCPrefab = class CCPrefab extends CCObject_1.CCObject {
    constructor() {
        super(...arguments);
        this._native = "";
        this.data = null;
        this.optimizationPolicy = 0;
        this.asyncLoadAssets = false;
        // 2.4.x
        this.readonly = false;
        // // 3.4.x
        this.persistent = false;
    }
};
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefab.prototype, "_native", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefab.prototype, "data", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefab.prototype, "optimizationPolicy", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefab.prototype, "asyncLoadAssets", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCPrefab.prototype, "readonly", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCPrefab.prototype, "persistent", void 0);
CCPrefab = __decorate([
    (0, _decorator_1.cctype)("cc.Prefab")
], CCPrefab);
exports.CCPrefab = CCPrefab;
