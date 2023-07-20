"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCSize = void 0;
const Size_1 = require("../../../values/Size");
const _decorator_1 = require("../../../_decorator");
let CCSize = class CCSize extends Size_1.Size {
    constructor() {
        super(...arguments);
        this.__type__ = "cc.Size";
    }
};
CCSize = __decorate([
    (0, _decorator_1.cctype)("cc.Size")
], CCSize);
exports.CCSize = CCSize;
