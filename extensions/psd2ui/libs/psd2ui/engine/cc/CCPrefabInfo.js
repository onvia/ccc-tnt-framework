"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCPrefabInfo = void 0;
const EditorVersion_1 = require("../../EditorVersion");
const Utils_1 = require("../../utils/Utils");
const _decorator_1 = require("../../_decorator");
const UIObject_1 = require("../UIObject");
// @cctype("cc.PrefabInfo")
class CCPrefabInfo extends UIObject_1.UIObject {
    constructor() {
        super();
        this.__type__ = "cc.PrefabInfo";
        this.root = { __id__: 1 };
        this.asset = { __id__: 0 };
        this.fileId = "";
        this.sync = false;
        this.fileId = Utils_1.utils.compressUuid(this.uuid);
    }
}
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefabInfo.prototype, "__type__", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefabInfo.prototype, "root", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefabInfo.prototype, "asset", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefabInfo.prototype, "fileId", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCPrefabInfo.prototype, "sync", void 0);
exports.CCPrefabInfo = CCPrefabInfo;
