"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCTypedArray = void 0;
const _decorator_1 = require("../../../_decorator");
let CCTypedArray = class CCTypedArray {
    constructor() {
        this.__type__ = "TypedArray";
        this.ctor = "Float64Array";
        this.array = [];
    }
    setPosition(x, y, z) {
        this.array[0] = x;
        this.array[1] = y;
        this.array[2] = z;
    }
    setRotation(x, y, z, w) {
        this.array[3] = x;
        this.array[4] = y;
        this.array[5] = z;
        this.array[6] = w;
    }
    setScale(x, y, z) {
        this.array[7] = x;
        this.array[8] = y;
        this.array[9] = z;
    }
};
CCTypedArray = __decorate([
    (0, _decorator_1.cctype)("TypedArray")
], CCTypedArray);
exports.CCTypedArray = CCTypedArray;
