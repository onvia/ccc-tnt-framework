"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCComponent = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCObject_1 = require("./CCObject");
class CCComponent extends CCObject_1.CCObject {
    constructor() {
        super(...arguments);
        this._enabled = true;
        this.node = null;
        this._id = "";
        // 3.4.x
        this.__prefab = null;
    }
}
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCComponent.prototype, "_enabled", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCComponent.prototype, "node", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCComponent.prototype, "_id", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCComponent.prototype, "__prefab", void 0);
exports.CCComponent = CCComponent;
