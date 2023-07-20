"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIObject = void 0;
const config_1 = require("../config");
const EditorVersion_1 = require("../EditorVersion");
const Utils_1 = require("../utils/Utils");
const _decorator_1 = require("../_decorator");
class UIObject {
    constructor() {
        this.uuid = "";
        this.idx = 0;
        this.uuid = Utils_1.utils.uuid();
    }
    toJSON() {
        var _a;
        let data = {};
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                // @ts-ignore
                if (this.__unserialization && this.__unserialization.indexOf(key) !== -1) {
                    continue;
                }
                // @ts-ignore
                let ver_tag = this.constructor.__ver_tag_id__;
                // 判断编辑器版本
                // @ts-ignore
                if (this._version && ((_a = this._version[ver_tag]) === null || _a === void 0 ? void 0 : _a[key])) {
                    // @ts-ignore
                    if (!this._version[ver_tag][key][EditorVersion_1.EditorVersion[config_1.config.editorVersion]]) {
                        continue;
                    }
                }
                const value = this[key];
                data[key] = value;
            }
        }
        return data;
    }
}
__decorate([
    _decorator_1.nonserialization
], UIObject.prototype, "uuid", void 0);
__decorate([
    _decorator_1.nonserialization
], UIObject.prototype, "idx", void 0);
exports.UIObject = UIObject;
