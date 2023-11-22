(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('minimist'), require('ag-psd/initialize-canvas'), require('ag-psd'), require('fs-extra'), require('path'), require('crypto'), require('pinyin-pro'), require('canvas')) :
    typeof define === 'function' && define.amd ? define(['minimist', 'ag-psd/initialize-canvas', 'ag-psd', 'fs-extra', 'path', 'crypto', 'pinyin-pro', 'canvas'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.minimist, null, global.psd, global.fs, global.path, global.crypto, global.pinyinPro, global.canvas));
})(this, (function (minimist, initializeCanvas, psd, fs, path, crypto, pinyinPro, canvas) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var minimist__default = /*#__PURE__*/_interopDefaultLegacy(minimist);
    var psd__namespace = /*#__PURE__*/_interopNamespace(psd);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
    var canvas__default = /*#__PURE__*/_interopDefaultLegacy(canvas);

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var EditorVersion;
    (function (EditorVersion) {
        EditorVersion[EditorVersion["all"] = 0] = "all";
        EditorVersion[EditorVersion["v249"] = 1] = "v249";
        EditorVersion[EditorVersion["v342"] = 2] = "v342";
    })(EditorVersion || (EditorVersion = {}));

    /** 禁止序列化 */
    let nonserialization = (target, propertyKey) => {
        if (!target.__unserialization) {
            target.__unserialization = [];
        }
        target.__unserialization.push(propertyKey);
        // if(!target.toJSON){
        //     // JSON.stringify 自动调用
        //     target.toJSON = function(){
        //         let data:Record<any,any> = {};
        //         for (const key in this) {
        //             if (Object.prototype.hasOwnProperty.call(this, key)) {
        //                 // @ts-ignore
        //                 if(this.__unserialization.indexOf(key) !== -1){
        //                     continue;
        //                 }
        //                 // 判断编辑器版本
        //                 if(this._version && !this._version[key][EditorVersion[config.editorVersion]]){
        //                     continue;
        //                 }
        //                 const value = this[key];
        //                 data[key] = value;
        //             }
        //         }
        //         return data;
        //     }
        // }
    };
    function cctype(type) {
        return (target) => {
            Object.defineProperty(target.prototype, "$__type__", {
                value: type,
                enumerable: true,
            });
        };
    }
    let _extends = {};
    let _class_attrs = {};
    let _target_map_ = {};
    let __verIdx = 0;
    function checkTag(target) {
        if (target.constructor.__ver_tag_id__ === undefined || _target_map_[target.constructor.__ver_tag_id__] != target) {
            target.constructor.__ver_tag_id__ = `${__verIdx}`;
            _target_map_[target.constructor.__ver_tag_id__] = target;
            __verIdx++;
        }
        return target.constructor.__ver_tag_id__;
    }
    function _assign(target, source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (key in target) {
                    continue;
                }
                target[key] = source[key];
            }
        }
    }
    function assign(target, ...sources) {
        for (let i = 0; i < sources.length; i++) {
            _assign(target, sources[i]);
        }
    }
    function ccversion(version) {
        return (target, propertyKey) => {
            let _class_name_ = target.constructor.name;
            _class_name_ = checkTag(target);
            !_class_attrs[_class_name_] && (_class_attrs[_class_name_] = {});
            let _class_obj = _class_attrs[_class_name_];
            if (!_class_obj[propertyKey]) {
                _class_obj[propertyKey] = {};
            }
            if (EditorVersion.all === version) {
                for (const key in EditorVersion) {
                    _class_obj[propertyKey][EditorVersion[key]] = true;
                }
            }
            else {
                _class_obj[propertyKey][EditorVersion[version]] = true;
            }
            var base = getSuper(target.constructor);
            // (base === Object || base === UIObject) && (base = null);
            if (base) {
                let parent = checkTag(base.prototype);
                !_extends[_class_name_] && (_extends[_class_name_] = parent);
                var _super = getSuper(base);
                while (_super) {
                    // if(_super === Object || _super === UIObject) {
                    //     // _super = null;
                    //     break;
                    // }
                    let super_tag = checkTag(_super.prototype);
                    !_extends[parent] && (_extends[parent] = super_tag);
                    _super = getSuper(_super);
                }
                while (parent) {
                    if (parent in _class_attrs) {
                        assign(_class_obj, _class_attrs[parent]);
                    }
                    parent = _extends[parent];
                }
            }
            if (!target._version) {
                target._version = {};
            }
            target._version[_class_name_] = _class_attrs[_class_name_] = _class_obj;
        };
    }
    function getSuper(ctor) {
        var proto = ctor.prototype; // binded function do not have prototype
        var dunderProto = proto && Object.getPrototypeOf(proto);
        return dunderProto && dunderProto.constructor;
    }

    // ------------decode-uuid
    const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const values = new Array(123); // max char code in base64Keys
    for (let i = 0; i < 123; ++i) {
        values[i] = 64;
    } // fill with placeholder('=') index
    for (let i = 0; i < 64; ++i) {
        values[BASE64_KEYS.charCodeAt(i)] = i;
    }
    // decoded value indexed by base64 char code
    const BASE64_VALUES = values;
    const HexChars = '0123456789abcdef'.split('');
    const _t = ['', '', '', ''];
    const UuidTemplate = _t.concat(_t, '-', _t, '-', _t, '-', _t, '-', _t, _t, _t);
    const Indices = UuidTemplate.map((x, i) => x === '-' ? NaN : i).filter(isFinite);
    let HexMap = {};
    {
        for (let i = 0; i < HexChars.length; i++) {
            let char = HexChars[i];
            HexMap[char] = i;
        }
    }
    class Utils {
        uuid() {
            var d = new Date().getTime();
            if (globalThis.performance && typeof globalThis.performance.now === "function") {
                d += performance.now(); //use high-precision timer if available
            }
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
        decodeUuid(base64) {
            const strs = base64.split('@');
            const uuid = strs[0];
            if (uuid.length !== 22) {
                return base64;
            }
            UuidTemplate[0] = base64[0];
            UuidTemplate[1] = base64[1];
            for (let i = 2, j = 2; i < 22; i += 2) {
                const lhs = BASE64_VALUES[base64.charCodeAt(i)];
                const rhs = BASE64_VALUES[base64.charCodeAt(i + 1)];
                UuidTemplate[Indices[j++]] = HexChars[lhs >> 2];
                UuidTemplate[Indices[j++]] = HexChars[((lhs & 3) << 2) | rhs >> 4];
                UuidTemplate[Indices[j++]] = HexChars[rhs & 0xF];
            }
            return base64.replace(uuid, UuidTemplate.join(''));
        }
        // 压缩uuid
        compressUuid(fullUuid) {
            const strs = fullUuid.split('@');
            const uuid = strs[0];
            if (uuid.length !== 36) {
                return fullUuid;
            }
            let zipUuid = [];
            zipUuid[0] = uuid[0];
            zipUuid[1] = uuid[1];
            let cleanUuid = uuid.replace('-', '').replace('-', '').replace('-', '').replace('-', '');
            for (let i = 2, j = 2; i < 32; i += 3) {
                const left = HexMap[String.fromCharCode(cleanUuid.charCodeAt(i))];
                const mid = HexMap[String.fromCharCode(cleanUuid.charCodeAt(i + 1))];
                const right = HexMap[String.fromCharCode(cleanUuid.charCodeAt(i + 2))];
                zipUuid[j++] = BASE64_KEYS[(left << 2) + (mid >> 2)];
                zipUuid[j++] = BASE64_KEYS[((mid & 3) << 4) + right];
            }
            return fullUuid.replace(uuid, zipUuid.join(''));
        }
        isNumber(val) {
            return (!isNaN(parseFloat(val)) && isFinite(val));
        }
    }
    const utils = new Utils();

    class UIObject {
        constructor() {
            this.uuid = "";
            this.idx = 0;
            this.uuid = utils.uuid();
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
                        if (!this._version[ver_tag][key][EditorVersion[config.editorVersion]]) {
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
        nonserialization
    ], UIObject.prototype, "uuid", void 0);
    __decorate([
        nonserialization
    ], UIObject.prototype, "idx", void 0);

    class CCObject extends UIObject {
        constructor() {
            super();
            this._name = "";
            this._objFlags = 0;
            // @ts-ignore
            this.__type__ = this.$__type__;
        }
    }
    __decorate([
        ccversion(EditorVersion.all)
    ], CCObject.prototype, "__type__", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCObject.prototype, "_name", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCObject.prototype, "_objFlags", void 0);

    class CCComponent extends CCObject {
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
        ccversion(EditorVersion.all)
    ], CCComponent.prototype, "_enabled", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCComponent.prototype, "node", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCComponent.prototype, "_id", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCComponent.prototype, "__prefab", void 0);

    let CCButton = class CCButton extends CCComponent {
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
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "duration", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "zoomScale", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCButton.prototype, "clickEvents", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "_N$interactable", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "_N$enableAutoGrayEffect", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "_N$transition", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "transition", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCButton.prototype, "_N$target", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCButton.prototype, "_interactable", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCButton.prototype, "_transition", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCButton.prototype, "_duration", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCButton.prototype, "_zoomScale", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCButton.prototype, "_target", void 0);
    CCButton = __decorate([
        cctype("cc.Button")
    ], CCButton);

    class Color {
        constructor(r, g, b, a) {
            this.r = Math.ceil(r || 0);
            this.g = Math.ceil(g || 0);
            this.b = Math.ceil(b || 0);
            this.a = Math.ceil(a || 0);
        }
        set(color) {
            this.r = Math.ceil(color.r || 0);
            this.g = Math.ceil(color.g || 0);
            this.b = Math.ceil(color.b || 0);
            this.a = Math.ceil(color.a || 0);
        }
        toHEX(fmt = '#rrggbb') {
            const prefix = '0';
            // #rrggbb
            const hex = [
                (this.r < 16 ? prefix : '') + (this.r).toString(16),
                (this.g < 16 ? prefix : '') + (this.g).toString(16),
                (this.b < 16 ? prefix : '') + (this.b).toString(16),
            ];
            if (fmt === '#rgb') {
                hex[0] = hex[0][0];
                hex[1] = hex[1][0];
                hex[2] = hex[2][0];
            }
            else if (fmt === '#rrggbbaa') {
                hex.push((this.a < 16 ? prefix : '') + (this.a).toString(16));
            }
            return hex.join('');
        }
    }

    class CCColor extends Color {
        constructor() {
            super(...arguments);
            this.__type__ = "cc.Color";
        }
    }

    class Vec2 {
        constructor(x = 0, y = 0) {
            this.x = x || 0;
            this.y = y || 0;
        }
    }

    let CCVec2 = class CCVec2 extends Vec2 {
        constructor() {
            super(...arguments);
            this.__type__ = "cc.Vec2";
        }
    };
    CCVec2 = __decorate([
        cctype("cc.Vec2")
    ], CCVec2);

    let CCSprite = class CCSprite extends CCComponent {
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
            this._fillCenter = new CCVec2();
            this._fillStart = 0;
            this._fillRange = 0;
            this._isTrimmedMode = true;
            this._atlas = null;
            // 3.4.x
            this._visFlags = 0;
            // 3.4.x
            this._customMaterial = null;
            // 3.4.x
            this._color = new CCColor(255, 255, 255, 255);
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
            if (config.editorVersion >= EditorVersion.v342) {
                this._srcBlendFactor = 2;
                this._dstBlendFactor = 4;
            }
        }
        setSpriteFrame(uuid) {
            if (config.editorVersion >= EditorVersion.v342) {
                this._spriteFrame = { __uuid__: `${uuid}@f9941`, __expectedType__: "cc.SpriteFrame" };
            }
            else {
                this._spriteFrame = { __uuid__: uuid };
            }
        }
    };
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCSprite.prototype, "_materials", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_srcBlendFactor", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_dstBlendFactor", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_spriteFrame", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_type", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_sizeMode", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_fillType", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_fillCenter", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_fillStart", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_fillRange", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_isTrimmedMode", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCSprite.prototype, "_atlas", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCSprite.prototype, "_visFlags", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCSprite.prototype, "_customMaterial", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCSprite.prototype, "_color", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCSprite.prototype, "_useGrayscale", void 0);
    CCSprite = __decorate([
        cctype("cc.Sprite")
    ], CCSprite);

    let CCProgressBar = class CCProgressBar extends CCComponent {
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
                        if (comp instanceof CCSprite) {
                            this.setBar(comp);
                            break outer;
                        }
                    }
                }
            }
        }
    };
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCProgressBar.prototype, "_N$totalLength", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCProgressBar.prototype, "_N$barSprite", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCProgressBar.prototype, "_N$mode", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCProgressBar.prototype, "_N$progress", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCProgressBar.prototype, "_N$reverse", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCProgressBar.prototype, "_barSprite", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCProgressBar.prototype, "_mode", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCProgressBar.prototype, "_totalLength", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCProgressBar.prototype, "_progress", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCProgressBar.prototype, "_reverse", void 0);
    CCProgressBar = __decorate([
        cctype("cc.ProgressBar")
    ], CCProgressBar);

    let CCToggle = class CCToggle extends CCButton {
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
                        if (comp instanceof CCSprite) {
                            this.setCheckMark(comp);
                            break outer;
                        }
                    }
                }
            }
        }
    };
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCToggle.prototype, "_N$isChecked", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCToggle.prototype, "toggleGroup", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCToggle.prototype, "checkMark", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCToggle.prototype, "checkEvents", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCToggle.prototype, "_isChecked", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCToggle.prototype, "_checkMark", void 0);
    CCToggle = __decorate([
        cctype("cc.Toggle")
    ], CCToggle);

    class Config {
        constructor() {
            this.help = `
--help           |   帮助信息                   
--init           |   初始化缓存文件              必须设置 --project-assets --cache 两项
--force-img      |   强制导出图片                即使在有缓存的情况下也要导出
--input          |   输入目录或者 psd 文件       非 init 时 必选 [dir or psd] 
--output         |   输出目录                   可选 缺省时为 --input [dir] 
--engine-version |   引擎版本                   可选           [v249 | v342] 
--project-assets |   指定项目文件夹              可选            [dir] 
--cache-remake   |   重新创建缓存文件            可选
--cache          |   缓存文件全路径              可选            [file-full-path] 
--config         |   预制体配置                  可选            [file-full-path] 
--pinyin         |   中文转拼音                  可选
--img-only       |   只导出图片                  可选           
--json           |   json 对象参数               插件工具使用 将所有参数用对象的形式编码成 base64 字符串     
`;
            this.editorVersion = EditorVersion.v249;
            this.DEFAULT_SPRITE_FRAME_MATERIAL = {
                [EditorVersion.v249]: "eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432",
                [EditorVersion.v342]: "",
            };
            this.DEFAULT_LABEL_MATERIAL = {
                [EditorVersion.v249]: "eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432",
                [EditorVersion.v342]: "",
            };
            this.CompMappings = {
                "Btn": CCButton,
                "ProgressBar": CCProgressBar,
                "Toggle": CCToggle,
            };
            // text 文本 Y 偏移
            this.textOffsetY = {
                default: 0,
                "36": 0,
            };
            // text 文本 行高偏移，默认为 0 ，行高默认为 字体大小
            this.textLineHeightOffset = 0;
        }
        get SpriteFrame_Material() {
            return this.DEFAULT_SPRITE_FRAME_MATERIAL[config.editorVersion];
        }
        get Label_Material() {
            return this.DEFAULT_LABEL_MATERIAL[config.editorVersion];
        }
    }
    const config = new Config();

    class FileUtils {
        // 深度遍历
        DFS(root, callback, depth = 0) {
            let exists = fs__default["default"].existsSync(root);
            if (!exists) {
                console.log(`FileUtils-> ${root} is not exists`);
                return;
            }
            let files = fs__default["default"].readdirSync(root);
            let _cacheDepth = depth;
            depth++;
            files.forEach((file) => {
                let fullPath = path__default["default"].join(root, file);
                let stat = fs__default["default"].lstatSync(fullPath);
                let isDirectory = stat.isDirectory();
                callback === null || callback === void 0 ? void 0 : callback({ isDirectory, fullPath, fileName: file, depth: _cacheDepth });
                if (!isDirectory) ;
                else {
                    this.DFS(fullPath, callback, depth);
                }
            });
        }
        filterFile(root, filter) {
            let exists = fs__default["default"].existsSync(root);
            if (!exists) {
                console.log(`FileUtils-> ${root} is not exists`);
                return;
            }
            var res = [];
            let files = fs__default["default"].readdirSync(root);
            files.forEach((file) => {
                let pathName = path__default["default"].join(root, file);
                let stat = fs__default["default"].lstatSync(pathName);
                let isDirectory = stat.isDirectory();
                // 只对文件进行判断
                if (!isDirectory) {
                    let isPass = filter(file);
                    if (!isPass) {
                        return;
                    }
                }
                if (!isDirectory) {
                    res.push(pathName);
                }
                else {
                    res = res.concat(this.filterFile(pathName, filter));
                }
            });
            return res;
        }
        getFolderFiles(dir, type) {
            let exists = fs__default["default"].existsSync(dir);
            if (!exists) {
                console.log(`FileUtils-> ${dir} is not exists`);
                return;
            }
            let res = [];
            let files = fs__default["default"].readdirSync(dir);
            files.forEach((file) => {
                let fullPath = path__default["default"].join(dir, file);
                let stat = fs__default["default"].lstatSync(fullPath);
                let isDirectory = stat.isDirectory();
                if (isDirectory) {
                    if (type === 'folder') {
                        res.push({ fullPath, basename: file });
                    }
                }
                else {
                    if (type === 'file') {
                        res.push({ fullPath, basename: file });
                    }
                }
            });
            return res;
        }
        writeFile(fullPath, data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (typeof data !== 'string') {
                    try {
                        data = JSON.stringify(data, null, 2);
                    }
                    catch (error) {
                        console.log(`FileUtils->writeFile `, error);
                        return;
                    }
                }
                console.log(`写入文件 ${fullPath}`);
                let dir = path__default["default"].dirname(fullPath);
                yield fs__default["default"].mkdirp(dir);
                yield fs__default["default"].writeFile(fullPath, data);
                console.log(`写入完成 ${fullPath} `);
            });
        }
        /** 获取文件的 md5 */
        getMD5(buffer) {
            if (typeof buffer === 'string') {
                buffer = fs__default["default"].readFileSync(buffer);
            }
            let md5 = crypto__default["default"].createHash("md5").update(buffer).digest("hex");
            return md5;
        }
    }
    let fileUtils = new FileUtils();

    class ImageCacheMgr {
        constructor() {
            this._imageMap = new Map();
            this._cachePath = null;
        }
        initWithPath(_path) {
            if (!fs__default["default"].existsSync(_path)) {
                console.log(`ImageCacheMgr-> 文件不存在: ${_path}`);
                return;
            }
            this._cachePath = _path;
            let content = fs__default["default"].readFileSync(_path, "utf-8");
            this.initWithFile(content);
        }
        initWithFile(file) {
            let json = JSON.parse(file);
            this.initWithJson(json);
        }
        initWithJson(json) {
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    this._imageMap.set(key, json[key]);
                }
            }
        }
        set(md5, warp) {
            this._imageMap.set(md5, warp);
        }
        has(md5) {
            return this._imageMap.has(md5);
        }
        get(md5) {
            return this._imageMap.get(md5);
        }
        saveImageMap(_path) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!_path) {
                    _path = this._cachePath;
                }
                if (!_path) {
                    console.log(`ImageCacheMgr-> 缓存路径 [${_path}] 不存在，无法保存  `);
                    return;
                }
                let obj = Object.create(null);
                this._imageMap.forEach((v, k) => {
                    obj[k] = v;
                });
                let content = JSON.stringify(obj, null, 2);
                yield fileUtils.writeFile(_path, content);
            });
        }
        // 获取已存在的图片，生成 md5: uuid 映射,
        loadImages(dir) {
            if (this._imageMap.size > 0) {
                console.error(`ImageCacheMgr-> 暂时只能在 启动时加载`);
                return;
            }
            let pngs = fileUtils.filterFile(dir, (fileName) => {
                let extname = path__default["default"].extname(fileName);
                if (extname == ".png") {
                    return true;
                }
                return false;
            });
            if (!pngs) {
                return;
            }
            for (let i = 0; i < pngs.length; i++) {
                const png = pngs[i];
                let md5 = fileUtils.getMD5(png);
                console.log(`ImageCacheMgr->缓存 `, png);
                let imageWarp = this._loadImageMetaWarp(`${png}.meta`);
                if (imageWarp) {
                    this.set(md5, imageWarp);
                }
            }
        }
        _loadImageMetaWarp(_path) {
            let content = fs__default["default"].readFileSync(_path, { encoding: "utf-8" });
            let imageWarp = null;
            switch (config.editorVersion) {
                case EditorVersion.v249:
                    imageWarp = this._loadImageMeta249(content, _path);
                    break;
                case EditorVersion.v342:
                    imageWarp = this._loadImageMeta34x(content, _path);
                    break;
                default:
                    console.log(`ImageCacheMgr-> 暂未实现 ${EditorVersion[config.editorVersion]} 版本`);
                    break;
            }
            return imageWarp;
        }
        _loadImageMeta249(metaContent, _path) {
            var _a;
            let filename = path__default["default"].basename(_path, ".png.meta");
            let fullpath = path__default["default"].join(path__default["default"].dirname(_path), `${filename}.png`);
            let metaJson = JSON.parse(metaContent);
            if (!((_a = metaJson === null || metaJson === void 0 ? void 0 : metaJson.subMetas) === null || _a === void 0 ? void 0 : _a[filename])) {
                return null;
            }
            let imageWarp = {
                path: fullpath,
                textureUuid: metaJson.subMetas[filename].uuid,
                uuid: metaJson.uuid,
                isOutput: true,
            };
            return imageWarp;
        }
        _loadImageMeta34x(metaContent, _path) {
            var _a;
            let filename = path__default["default"].basename(_path, ".png.meta");
            let fullpath = path__default["default"].join(path__default["default"].dirname(_path), `${filename}.png`);
            let metaJson = JSON.parse(metaContent);
            if (!((_a = metaJson === null || metaJson === void 0 ? void 0 : metaJson.subMetas) === null || _a === void 0 ? void 0 : _a["6c48a"])) {
                return null;
            }
            let uuid = metaJson.subMetas["6c48a"].uuid.replace("@6c48a", "");
            let imageWarp = {
                path: fullpath,
                textureUuid: uuid,
                uuid: uuid,
                isOutput: true,
            };
            return imageWarp;
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new ImageCacheMgr();
            }
            return this._instance;
        }
    }
    ImageCacheMgr._instance = null;
    const imageCacheMgr = ImageCacheMgr.getInstance();

    class ImageMgr {
        constructor() {
            // 镜像图像管理
            this._imageIdKeyMap = new Map();
            // 当前 psd 所有的图片
            this._imageMapMd5Key = new Map();
            this._imageMapImgNameKey = new Map();
        }
        // /** 相同名称不同  md5 图片的后缀id */
        // private _sameImgNameId: Record<string, number> = {};
        add(psdImage) {
            var _a;
            // 不忽略导出图片
            if (!psdImage.isIgnore() && !psdImage.isBind()) {
                if (!this._imageMapMd5Key.has(psdImage.md5)) {
                    this._imageMapMd5Key.set(psdImage.md5, psdImage);
                }
            }
            if (typeof ((_a = psdImage.attr.comps.img) === null || _a === void 0 ? void 0 : _a.id) != "undefined") {
                let id = psdImage.attr.comps.img.id;
                if (this._imageIdKeyMap.has(id)) {
                    console.warn(`ImageMgr-> ${psdImage.source.name} 已有相同 @img{id:${id}}，请检查 psd 图层`);
                }
                this._imageIdKeyMap.set(id, psdImage);
            }
            this.handleSameImgName(psdImage, psdImage.imgName, 0);
        }
        /**
         * 处理相同名称的图片
         *
         * @param {PsdImage} psdImage
         * @param {string} imgName
         * @param {number} idx
         * @memberof ImageMgr
         */
        handleSameImgName(psdImage, imgName, idx) {
            if (this._imageMapImgNameKey.has(imgName)) {
                let _psdImage = this._imageMapImgNameKey.get(imgName);
                if (_psdImage.md5 != psdImage.md5) {
                    this.handleSameImgName(psdImage, `${psdImage.imgName}_R${idx}`, idx + 1);
                }
                else {
                    psdImage.imgName = imgName;
                }
            }
            else {
                psdImage.imgName = imgName;
                this._imageMapImgNameKey.set(imgName, psdImage);
            }
        }
        getAllImage() {
            return this._imageMapMd5Key;
        }
        /** 尝试获取有编号的图像图层 */
        getSerialNumberImage(psdImage) {
            var _a, _b, _c;
            let bind = (_b = (_a = psdImage.attr.comps.flip) === null || _a === void 0 ? void 0 : _a.bind) !== null && _b !== void 0 ? _b : (_c = psdImage.attr.comps.img) === null || _c === void 0 ? void 0 : _c.bind;
            if (typeof bind != 'undefined') {
                if (this._imageIdKeyMap.has(bind)) {
                    return this._imageIdKeyMap.get(bind);
                }
                else {
                    console.warn(`ImageMgr-> ${psdImage.source.name} 未找到绑定的图像 {${bind}}，请检查 psd 图层`);
                }
            }
            return psdImage;
        }
        clear() {
            this._imageIdKeyMap.clear();
            this._imageMapMd5Key.clear();
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new ImageMgr();
            }
            return this._instance;
        }
    }
    ImageMgr._instance = null;
    const imageMgr = ImageMgr.getInstance();

    var LayerType;
    (function (LayerType) {
        LayerType[LayerType["Doc"] = 0] = "Doc";
        LayerType[LayerType["Group"] = 1] = "Group";
        LayerType[LayerType["Text"] = 2] = "Text";
        LayerType[LayerType["Image"] = 3] = "Image";
    })(LayerType || (LayerType = {}));

    class Rect {
        constructor(left = 0, right = 0, top = 0, bottom = 0) {
            if (typeof left == 'object') {
                this.set(left);
                return;
            }
            this.left = left || 0;
            this.right = right || 0;
            this.top = top || 0;
            this.bottom = bottom || 0;
        }
        set(rect) {
            this.left = rect.left;
            this.right = rect.right;
            this.top = rect.top;
            this.bottom = rect.bottom;
        }
    }

    class Size {
        constructor(width = 0, height = 0) {
            this.width = width || 0;
            this.height = height || 0;
        }
    }

    class Vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
    }

    class PsdLayer {
        constructor(source, parent, rootDoc) {
            var _a;
            this.uuid = utils.uuid();
            this.source = source;
            this.parent = parent;
            this.rootDoc = rootDoc;
            this.name = source.name;
            this.position = new Vec2();
            this.size = new Size();
            this.rect = new Rect(source);
            // this.anchorPoint = new Vec2();
            this.anchorPoint = new Vec2(0.5, 0.5);
            this.hidden = false;
            this.opacity = 255;
            this.color = new Color(255, 255, 255, 255);
            console.log(`PsdLayer->解析到图层 `, this.name);
            this.attr = this.parseNameRule(this.name);
            // // 更新名字
            this.name = this.chineseToPinyin(((_a = this.attr) === null || _a === void 0 ? void 0 : _a.name) || this.name);
            // 使用配置的缩放系数
            // let _scale = this.attr?.comps.scale;
            // this.scale = new Vec3(_scale?.x ?? 1, _scale?.y ?? 1, 1);
            this.scale = new Vec3(1, 1, 1);
        }
        parseNameRule(name) {
            var _a, _b, _c;
            if (!name) {
                return;
            }
            name = name.trim();
            let fragments = name.split("@");
            if (fragments.length === 0) {
                console.error(`PsdLayer-> 名字解析错误`);
                return;
            }
            let obj = {
                name: (_c = (_b = (_a = fragments[0]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.replace(/\.|>|\/|\ /g, "_")) !== null && _c !== void 0 ? _c : "unknow",
                comps: {},
            };
            for (let i = 1; i < fragments.length; i++) {
                const fragment = this.removeChineseFromEnd(fragments[i].trim()).trim(); // 删除规则尾部的中文
                let attr = {};
                let startIdx = fragment.indexOf("{");
                let comp = fragment;
                if (startIdx != -1) {
                    let endIdx = fragment.indexOf("}");
                    if (endIdx == -1) {
                        console.log(`PsdLayer->${name} 属性 解析错误`);
                        continue;
                    }
                    let attrStr = fragment.substring(startIdx + 1, endIdx);
                    comp = fragment.substr(0, startIdx);
                    attrStr = attrStr.trim();
                    let attrs = attrStr.split(",");
                    attrs.forEach((str) => {
                        str = str.trim();
                        let strs = str.split(":");
                        if (!strs.length) {
                            console.log(`PsdLayer->${name} 属性 解析错误`);
                            return;
                        }
                        strs.map((v) => {
                            return v.trim();
                        });
                        attr[strs[0]] = utils.isNumber(strs[1]) ? parseFloat(strs[1]) : strs[1];
                    });
                }
                comp = comp.trim();
                comp = comp.replace(":", ""); // 防呆，删除 key 中的冒号，
                obj.comps[comp] = attr;
            }
            // 获取别名的值
            obj.comps.ignore = obj.comps.ignore || obj.comps.ig;
            obj.comps.ignorenode = obj.comps.ignorenode || obj.comps.ignode;
            obj.comps.ignoreimg = obj.comps.ignoreimg || obj.comps.igimg;
            obj.comps.Btn = obj.comps.Btn || obj.comps.btn;
            obj.comps.ProgressBar = obj.comps.ProgressBar || obj.comps.progressBar;
            obj.comps.Toggle = obj.comps.Toggle || obj.comps.toggle;
            // 图片名中文转拼音
            if (obj.comps.img) {
                if (obj.comps.img.name) {
                    obj.comps.img.name = this.chineseToPinyin(obj.comps.img.name);
                }
            }
            // 将mirror filpX filpY  进行合并
            if (obj.comps.flip || obj.comps.flipX || obj.comps.flipY) {
                obj.comps.flip = Object.assign({}, obj.comps.flip, obj.comps.flipX, obj.comps.flipY);
                if (obj.comps.flipX) {
                    obj.comps.flip.x = 1;
                }
                if (obj.comps.flipY) {
                    obj.comps.flip.y = 1;
                }
                //   x,y 都缺省时，默认 x 方向镜像
                if (typeof obj.comps.flip.bind !== 'undefined') {
                    if (!obj.comps.flip.y) {
                        obj.comps.flip.x = 1;
                    }
                    // 只有作为镜像图片使用的时候才反向赋值
                    // 反向赋值，防止使用的时候值错误
                    if (obj.comps.flip.x) {
                        obj.comps.flipX = Object.assign({}, obj.comps.flipX, obj.comps.flip);
                    }
                    if (obj.comps.flip.y) {
                        obj.comps.flipY = Object.assign({}, obj.comps.flipY, obj.comps.flip);
                    }
                }
            }
            // // 检查冲突
            // if (obj.comps.full && obj.comps.size) {
            //     console.warn(`PsdLayer->${obj.name} 同时存在 @full 和 @size`);
            // }
            return obj;
        }
        removeChineseFromEnd(inputString) {
            if (!inputString) {
                return inputString;
            }
            const chineseRegex = /[\u4e00-\u9fa5]+$/;
            const match = inputString.trim().match(chineseRegex);
            if (match && match[0]) {
                const chineseLength = match[0].length;
                return this.removeChineseFromEnd(inputString.slice(0, -chineseLength));
            }
            return inputString;
        }
        /** 解析数据 */
        parseSource() {
            var _a, _b;
            let _source = this.source;
            // psd文档
            if (!this.parent) {
                return false;
            }
            this.hidden = _source.hidden;
            this.opacity = Math.round(_source.opacity * 255);
            // 获取锚点
            let ar = this.attr.comps.ar;
            if (ar) {
                this.anchorPoint.x = (_a = ar.x) !== null && _a !== void 0 ? _a : this.anchorPoint.x;
                this.anchorPoint.y = (_b = ar.y) !== null && _b !== void 0 ? _b : this.anchorPoint.y;
            }
            this.computeBasePosition();
            return true;
        }
        /** 解析 effect */
        parseEffects() {
            // 颜色叠加 暂时搞不定
            // if(this.source.effects?.solidFill){
            //     let solidFills = this.source.effects?.solidFill;
            //     for (let i = 0; i < solidFills.length; i++) {
            //         const solidFill = solidFills[i];
            //         if(solidFill.enabled){
            //             let color = solidFill.color;
            //             this.color = new Color(color.r,color.g,color.b,solidFill.opacity * 255);
            //         }
            //     }
            // }
        }
        /** 中文转拼音 */
        chineseToPinyin(text) {
            if (!text || !PsdLayer.isPinyin) {
                return text;
            }
            let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            if (!reg.test(text)) {
                return text;
            }
            let names = pinyinPro.pinyin(text, {
                toneType: "none",
                type: "array"
            });
            names = names.map((text) => {
                return text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();
            });
            return names.join("");
        }
        // 计算初始坐标 左下角 0,0 为锚点
        computeBasePosition() {
            if (!this.rootDoc) {
                return;
            }
            let _rect = this.rect;
            let width = (_rect.right - _rect.left);
            let height = (_rect.bottom - _rect.top);
            this.size.width = width;
            this.size.height = height;
            // 位置 左下角为锚点
            let x = _rect.left;
            let y = (this.rootDoc.size.height - _rect.bottom);
            this.position.x = x;
            this.position.y = y;
        }
        // 根据锚点计算坐标
        updatePositionWithAR() {
            if (!this.parent) {
                return;
            }
            let parent = this.parent;
            while (parent) {
                this.position.x -= parent.position.x;
                this.position.y -= parent.position.y;
                parent = parent.parent;
            }
            // this.position.x  = this.position.x - this.parent.size.width * this.parent.anchorPoint.x + this.size.width * this.anchorPoint.x;
            // this.position.y  = this.position.y - this.parent.size.height * this.parent.anchorPoint.y + this.size.height * this.anchorPoint.y;
            this.position.x = this.position.x - this.rootDoc.size.width * this.rootDoc.anchorPoint.x + this.size.width * this.anchorPoint.x;
            this.position.y = this.position.y - this.rootDoc.size.height * this.rootDoc.anchorPoint.y + this.size.height * this.anchorPoint.y;
        }
    }
    PsdLayer.isPinyin = false;

    class PsdGroup extends PsdLayer {
        constructor(source, parent, rootDoc) {
            super(source, parent, rootDoc);
            this.children = [];
            if (rootDoc) {
                this.rect = new Rect(0, rootDoc.size.width, 0, rootDoc.size.height);
            }
        }
        parseSource() {
            var _a;
            super.parseSource();
            if (!((_a = this.attr) === null || _a === void 0 ? void 0 : _a.comps.full)) {
                this.resize();
                this.computeBasePosition();
            }
            return true;
        }
        resize() {
            if (!this.children.length) {
                return;
            }
            let left = Number.MAX_SAFE_INTEGER;
            let right = Number.MIN_SAFE_INTEGER;
            let top = Number.MAX_SAFE_INTEGER;
            let bottom = Number.MIN_SAFE_INTEGER;
            for (let i = 0; i < this.children.length; i++) {
                const element = this.children[i];
                let _rect = element.rect;
                left = Math.min(_rect.left, left);
                right = Math.max(_rect.right, right);
                top = Math.min(_rect.top, top);
                bottom = Math.max(_rect.bottom, bottom);
            }
            this.rect.left = left;
            this.rect.right = right;
            this.rect.top = top;
            this.rect.bottom = bottom;
        }
        onCtor() {
        }
    }

    class PsdDocument extends PsdGroup {
        constructor(source) {
            super(source, null, null);
            /** 当前文档所有的图片 */
            this.images = new Map();
            this.objectMap = new Map();
            this.objectArray = [];
            this.size = new Size(source.width, source.height);
            this.rect = new Rect(0, this.size.width, 0, this.size.height);
        }
        pushObject(uiObject) {
            let idx = this.objectArray.length;
            uiObject.idx = idx;
            this.objectMap.set(uiObject.uuid, idx);
            this.objectArray.push(uiObject);
            return idx;
        }
        getObjectIdx(uuid) {
            let idx = this.objectMap.get(uuid);
            return idx;
        }
        getObject(uuid) {
            let idx = this.objectMap.get(uuid);
            if (idx < this.objectArray.length) {
                return this.objectArray[idx];
            }
            return null;
        }
        onCtor() {
            super.onCtor();
        }
    }

    class Texture9Utils {
        static safeBorder(_canvas, border) {
            var _a, _b, _c, _d;
            border.l = ((_a = border.l) !== null && _a !== void 0 ? _a : border.r) || 0;
            border.r = ((_b = border.r) !== null && _b !== void 0 ? _b : border.l) || 0;
            border.t = ((_c = border.t) !== null && _c !== void 0 ? _c : border.b) || 0;
            border.b = ((_d = border.b) !== null && _d !== void 0 ? _d : border.t) || 0;
            return border;
        }
        static split(_canvas, border) {
            this.safeBorder(_canvas, border);
            let cw = _canvas.width;
            let ch = _canvas.height;
            let space = 4;
            let left = border.l || cw;
            let right = border.r || cw;
            let top = border.t || ch;
            let bottom = border.b || ch;
            if (border.b == 0 && border.t == 0 && border.l == 0 && border.r == 0) {
                return _canvas;
            }
            if (border.l + border.r > cw + space) {
                console.log(`Texture9Utils-> 设置的九宫格 left， right 数据不合理，请重新设置`);
                return _canvas;
            }
            if (border.b + border.t > ch + space) {
                console.log(`Texture9Utils-> 设置的九宫格 bottom， top 数据不合理，请重新设置`);
                return _canvas;
            }
            let newCanvas = canvas__default["default"].createCanvas(Math.min(cw, border.l + border.r + space) || cw, Math.min(ch, border.b + border.t + space) || ch);
            let ctx = newCanvas.getContext("2d");
            // 左上
            ctx.drawImage(_canvas, 0, 0, left + space, top + space, 0, 0, left + space, top + space);
            // 左下
            ctx.drawImage(_canvas, 0, ch - bottom, left + space, bottom, 0, top + space, left + space, bottom);
            // 右上
            ctx.drawImage(_canvas, cw - left, 0, right, top + space, left + space, 0, right, top + space);
            // 右下
            ctx.drawImage(_canvas, cw - left, ch - bottom, right, bottom, left + space, top + space, right, bottom);
            return newCanvas;
        }
    }

    class PsdImage extends PsdLayer {
        constructor(source, parent, rootDoc) {
            var _a;
            super(source, parent, rootDoc);
            this.textureUuid = utils.uuid();
            // img name
            this.imgName = ((_a = this.attr.comps.img) === null || _a === void 0 ? void 0 : _a.name) || this.name;
            // .9
            if (this.attr.comps['.9']) {
                let s9 = this.attr.comps['.9'];
                this.s9 = Texture9Utils.safeBorder(this.source.canvas, s9);
                let newCanvas = Texture9Utils.split(this.source.canvas, s9);
                this.source.canvas = newCanvas;
            }
            let canvas = this.source.canvas;
            this.imgBuffer = canvas.toBuffer('image/png');
            this.md5 = fileUtils.getMD5(this.imgBuffer);
            this.textureSize = new Size(canvas.width, canvas.height);
            this.scale = new Vec3((this.isFlipX() ? -1 : 1) * this.scale.x, (this.isFlipY() ? -1 : 1) * this.scale.y, 1);
        }
        onCtor() {
        }
        isIgnore() {
            // 
            if (this.attr.comps.ignore || this.attr.comps.ignoreimg) {
                return true;
            }
            return false;
        }
        /** 是否是镜像图片 */
        isBind() {
            var _a, _b;
            return typeof ((_a = this.attr.comps.flip) === null || _a === void 0 ? void 0 : _a.bind) !== 'undefined'
                || typeof ((_b = this.attr.comps.img) === null || _b === void 0 ? void 0 : _b.bind) !== 'undefined';
        }
        /** 是否是 x 方向镜像图片 */
        isFlipX() {
            var _a;
            return typeof ((_a = this.attr.comps.flipX) === null || _a === void 0 ? void 0 : _a.bind) !== 'undefined';
        }
        /** 是否是 y 方向镜像图片 */
        isFlipY() {
            var _a;
            return typeof ((_a = this.attr.comps.flipY) === null || _a === void 0 ? void 0 : _a.bind) !== 'undefined';
        }
        // 根据锚点计算坐标
        updatePositionWithAR() {
            if (!this.parent) {
                return;
            }
            let parent = this.parent;
            while (parent) {
                this.position.x -= parent.position.x;
                this.position.y -= parent.position.y;
                parent = parent.parent;
            }
            // this.position.x  = this.position.x - this.parent.size.width * this.parent.anchorPoint.x + this.size.width * this.anchorPoint.x;
            // this.position.y  = this.position.y - this.parent.size.height * this.parent.anchorPoint.y + this.size.height * this.anchorPoint.y;
            // 如果是镜像图片，则特殊处理
            let arX = (this.isFlipX() ? (1 - this.anchorPoint.x) : this.anchorPoint.x);
            let arY = (this.isFlipY() ? (1 - this.anchorPoint.y) : this.anchorPoint.y);
            this.position.x = this.position.x - this.rootDoc.size.width * this.rootDoc.anchorPoint.x + this.size.width * arX;
            this.position.y = this.position.y - this.rootDoc.size.height * this.rootDoc.anchorPoint.y + this.size.height * arY;
        }
    }

    class PsdText extends PsdLayer {
        parseSource() {
            super.parseSource();
            let textSource = this.source.text;
            let style = textSource.style;
            if (style) {
                let fillColor = style.fillColor;
                if (fillColor) {
                    this.color = new Color(fillColor.r, fillColor.g, fillColor.b, fillColor.a * 255);
                }
            }
            this.text = textSource.text;
            this.fontSize = style.fontSize;
            this.offsetY = config.textOffsetY[this.fontSize] || config.textOffsetY["default"] || 0;
            this.parseSolidFill();
            this.parseStroke();
            return true;
        }
        onCtor() {
        }
        /** 描边 */
        parseStroke() {
            var _a, _b;
            if ((_a = this.source.effects) === null || _a === void 0 ? void 0 : _a.stroke) {
                let stroke = (_b = this.source.effects) === null || _b === void 0 ? void 0 : _b.stroke[0];
                // 外描边
                if ((stroke === null || stroke === void 0 ? void 0 : stroke.enabled) && (stroke === null || stroke === void 0 ? void 0 : stroke.position) === "outside") {
                    let color = stroke.color;
                    this.outline = {
                        width: stroke.size.value,
                        color: new Color(color.r, color.g, color.b, stroke.opacity * 255)
                    };
                }
            }
        }
        /** 解析 颜色叠加 */
        parseSolidFill() {
            var _a, _b;
            if ((_a = this.source.effects) === null || _a === void 0 ? void 0 : _a.solidFill) {
                let solidFills = (_b = this.source.effects) === null || _b === void 0 ? void 0 : _b.solidFill;
                for (let i = 0; i < solidFills.length; i++) {
                    const solidFill = solidFills[i];
                    if (solidFill.enabled) {
                        let color = solidFill.color;
                        this.color = new Color(color.r, color.g, color.b, solidFill.opacity * 255);
                    }
                }
            }
        }
    }

    class Parser {
        /** 解析图层类型 */
        parseLayerType(source) {
            if ("children" in source) {
                if ("width" in source && "height" in source) {
                    // Document
                    return LayerType.Doc;
                }
                else {
                    // Group
                    return LayerType.Group;
                }
            }
            else if ("text" in source) {
                //  Text
                return LayerType.Text;
            }
            // else if ('placedLayer' in layer) {
            //     // 智能对象
            // }
            return LayerType.Image;
        }
        parseLayer(source, parent, rootDoc) {
            let layer = null;
            let layerType = this.parseLayerType(source);
            switch (layerType) {
                case LayerType.Doc:
                case LayerType.Group:
                    {
                        let group = null;
                        // Group
                        if (layerType == LayerType.Group) {
                            group = new PsdGroup(source, parent, rootDoc);
                            if (group.attr.comps.ignorenode || group.attr.comps.ignore) {
                                return null;
                            }
                        }
                        else {
                            // Document
                            group = new PsdDocument(source);
                        }
                        for (let i = 0; i < source.children.length; i++) {
                            const childSource = source.children[i];
                            let child = this.parseLayer(childSource, group, rootDoc || group);
                            if (child) {
                                if (!child.attr.comps.ignorenode && !child.attr.comps.ignore) {
                                    // 没有进行忽略节点的时候才放入列表
                                    group.children.push(child);
                                }
                            }
                            else {
                                console.error(`图层解析错误`);
                            }
                        }
                        layer = group;
                    }
                    break;
                case LayerType.Image:
                    {
                        // 
                        if (!source.canvas) {
                            console.error(`Parser-> 空图层 ${source === null || source === void 0 ? void 0 : source.name}`);
                            return null;
                        }
                        // Image
                        let image = layer = new PsdImage(source, parent, rootDoc);
                        imageMgr.add(image);
                        // 没有设置忽略且不说镜像的情况下才进行缓存
                        if (!image.isIgnore() && !image.isBind()) {
                            if (!imageCacheMgr.has(image.md5)) {
                                imageCacheMgr.set(image.md5, {
                                    uuid: image.uuid,
                                    textureUuid: image.textureUuid,
                                });
                            }
                        }
                    }
                    break;
                case LayerType.Text:
                    {
                        //  Text
                        layer = new PsdText(source, parent, rootDoc);
                    }
                    break;
            }
            layer.layerType = layerType;
            layer.parseSource();
            layer.onCtor();
            return layer;
        }
    }
    const parser = new Parser();

    // @cctype("cc.CompPrefabInfo")
    class CCCompPrefabInfo extends UIObject {
        constructor() {
            super();
            this.__type__ = "cc.CompPrefabInfo";
            this.fileId = "";
            this.fileId = utils.compressUuid(this.uuid);
        }
    }

    let CCSize = class CCSize extends Size {
        constructor() {
            super(...arguments);
            this.__type__ = "cc.Size";
        }
    };
    CCSize = __decorate([
        cctype("cc.Size")
    ], CCSize);

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
        cctype("TypedArray")
    ], CCTypedArray);

    class CCVec3 extends Vec3 {
        constructor() {
            super(...arguments);
            this.__type__ = "cc.Vec3";
        }
    }

    let CCNode = class CCNode extends CCObject {
        constructor(psdDoc) {
            super();
            this._parent = null;
            this._children = [];
            this._active = true;
            this._components = [];
            this._prefab = null;
            this._id = "";
            // 2.4.x
            this._opacity = 255;
            // 2.4.x
            this._color = new CCColor(255, 255, 255, 255);
            // 2.4.x
            this._contentSize = new CCSize();
            // 2.4.x
            this._anchorPoint = new CCVec2(0, 0);
            // 2.4.x
            this._trs = new CCTypedArray();
            // 2.4.x
            this._eulerAngles = new CCVec3();
            // 2.4.x
            this._skewX = 0;
            // 2.4.x
            this._skewY = 0;
            // 2.4.x
            this._is3DNode = false;
            // 2.4.x
            this._groupIndex = 0;
            // 2.4.x
            this.groupIndex = 0;
            // 2.4.x
            this._renderEnable = false;
            // 2.4.x
            this._bfsRenderFlag = false;
            // 3.4.x
            this._lpos = new CCVec3();
            // 3.4.x
            this._lrot = new CCVec3();
            // 3.4.x
            this._lscale = new CCVec3();
            // 3.4.x
            this._euler = new CCVec3();
            // 3.4.x
            this._layer = 33554432;
            this.psdDoc = null;
            this.components = [];
            this.children = [];
            if (psdDoc) {
                this.psdDoc = psdDoc;
                psdDoc.pushObject(this);
            }
        }
        addComponent(comp) {
            comp.node = { __id__: this.idx };
            let compIdx = this.psdDoc.pushObject(comp);
            this._components.push({ __id__: compIdx });
            this.components.push(comp);
            if (config.editorVersion >= EditorVersion.v342) {
                this.addCompPrefabInfo(comp);
            }
        }
        addCompPrefabInfo(comp) {
            let compInfo = new CCCompPrefabInfo();
            let compIdx = this.psdDoc.pushObject(compInfo);
            comp.__prefab = { __id__: compIdx };
        }
        addChild(child) {
            this._children.push({ __id__: child.idx });
            child._parent = { __id__: this.idx };
            this.children.push(child);
        }
    };
    __decorate([
        ccversion(EditorVersion.all)
    ], CCNode.prototype, "_parent", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCNode.prototype, "_children", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCNode.prototype, "_active", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCNode.prototype, "_components", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCNode.prototype, "_prefab", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCNode.prototype, "_id", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_opacity", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_color", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_contentSize", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_anchorPoint", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_trs", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_eulerAngles", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_skewX", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_skewY", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_is3DNode", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_groupIndex", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "groupIndex", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_renderEnable", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCNode.prototype, "_bfsRenderFlag", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCNode.prototype, "_lpos", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCNode.prototype, "_lrot", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCNode.prototype, "_lscale", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCNode.prototype, "_euler", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCNode.prototype, "_layer", void 0);
    __decorate([
        nonserialization
    ], CCNode.prototype, "psdDoc", void 0);
    __decorate([
        nonserialization
    ], CCNode.prototype, "components", void 0);
    __decorate([
        nonserialization
    ], CCNode.prototype, "children", void 0);
    CCNode = __decorate([
        cctype("cc.Node")
    ], CCNode);

    // @cctype("cc.PrefabInfo")
    class CCPrefabInfo extends UIObject {
        constructor() {
            super();
            this.__type__ = "cc.PrefabInfo";
            this.root = { __id__: 1 };
            this.asset = { __id__: 0 };
            this.fileId = "";
            this.sync = false;
            this.fileId = utils.compressUuid(this.uuid);
        }
    }
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefabInfo.prototype, "__type__", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefabInfo.prototype, "root", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefabInfo.prototype, "asset", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefabInfo.prototype, "fileId", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefabInfo.prototype, "sync", void 0);

    let CCPrefab = class CCPrefab extends CCObject {
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
        ccversion(EditorVersion.all)
    ], CCPrefab.prototype, "_native", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefab.prototype, "data", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefab.prototype, "optimizationPolicy", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCPrefab.prototype, "asyncLoadAssets", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCPrefab.prototype, "readonly", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCPrefab.prototype, "persistent", void 0);
    CCPrefab = __decorate([
        cctype("cc.Prefab")
    ], CCPrefab);

    let CCLabel = class CCLabel extends CCComponent {
        constructor() {
            super(...arguments);
            this._srcBlendFactor = 770; // 3.4.x = 2
            this._dstBlendFactor = 771; // 3.4.x = 4
            this._string = "";
            this._fontSize = 0;
            this._lineHeight = 0;
            this._enableWrapText = true;
            this._isSystemFontUsed = true;
            this._spacingX = 0;
            this._underlineHeight = 0;
            this._materials = [];
            // 2.4.x
            this._N$string = "";
            // 2.4.x
            this._N$file = null;
            // 2.4.x
            this._batchAsBitmap = false;
            // 2.4.x
            this._styleFlags = 0;
            // 2.4.x
            this._N$horizontalAlign = 1;
            // 2.4.x
            this._N$verticalAlign = 1;
            // 2.4.x
            this._N$fontFamily = "Arial";
            // 2.4.x
            this._N$overflow = 0;
            // 2.4.x
            this._N$cacheMode = 0;
            // 3.4.x
            this._visFlags = 0;
            // 3.4.x
            this._customMaterial = null;
            // 3.4.x
            this._color = new CCColor(255, 255, 255, 255);
            // 3.4.x
            this._overflow = 0;
            // // 3.4.x
            this._cacheMode = 0;
            this._horizontalAlign = 1;
            this._verticalAlign = 1;
            this._actualFontSize = 0;
            this._isItalic = false;
            this._isBold = false;
            this._isUnderline = false;
        }
        updateWithLayer(psdLayer) {
            this._fontSize = psdLayer.fontSize;
            // this._actualFontSize = this._fontSize;
            this._string = this._N$string = psdLayer.text;
            this._lineHeight = this._fontSize + config.textLineHeightOffset;
            if (config.editorVersion >= EditorVersion.v342) {
                this._srcBlendFactor = 2;
                this._dstBlendFactor = 4;
            }
        }
    };
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_srcBlendFactor", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_dstBlendFactor", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_string", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_fontSize", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_lineHeight", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_enableWrapText", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_isSystemFontUsed", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_spacingX", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabel.prototype, "_underlineHeight", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_materials", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$string", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$file", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_batchAsBitmap", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_styleFlags", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$horizontalAlign", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$verticalAlign", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$fontFamily", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$overflow", void 0);
    __decorate([
        ccversion(EditorVersion.v249)
    ], CCLabel.prototype, "_N$cacheMode", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_visFlags", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_customMaterial", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_color", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_overflow", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_cacheMode", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_horizontalAlign", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_verticalAlign", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_actualFontSize", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_isItalic", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_isBold", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCLabel.prototype, "_isUnderline", void 0);
    CCLabel = __decorate([
        cctype("cc.Label")
    ], CCLabel);

    let CCLabelOutline = class CCLabelOutline extends CCComponent {
        constructor() {
            super(...arguments);
            this._color = new CCColor(255, 255, 255, 255);
            this._width = 1;
        }
        updateWithLayer(psdLayer) {
            this._width = psdLayer.outline.width;
            this._color.set(psdLayer.outline.color);
        }
    };
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabelOutline.prototype, "_color", void 0);
    __decorate([
        ccversion(EditorVersion.all)
    ], CCLabelOutline.prototype, "_width", void 0);
    CCLabelOutline = __decorate([
        cctype("cc.LabelOutline")
    ], CCLabelOutline);

    class ExportImageMgr {
        constructor() {
            this.textObjects = [];
        }
        test() {
            const outDir = path__default["default"].join(__dirname, "..", "out");
            let psdPath = "./test-img-only/境界奖励-优化.psd";
            this.parsePsd(psdPath, outDir);
        }
        exec(args) {
            return __awaiter(this, void 0, void 0, function* () {
                // 检查参数
                if (!this.checkArgs(args)) {
                    return;
                }
                // 判断输入是文件夹还是文件
                let stat = fs__default["default"].lstatSync(args.input);
                let isDirectory = stat.isDirectory();
                if (isDirectory) {
                    if (!args.output) {
                        args.output = path__default["default"].join(args.input, "psd2ui");
                    }
                    this.parsePsdDir(args.input, args.output);
                }
                else {
                    if (!args.output) {
                        let input_dir = path__default["default"].dirname(args.input);
                        args.output = path__default["default"].join(input_dir, "psd2ui");
                    }
                    this.parsePsd(args.input, args.output);
                }
            });
        }
        // 检查参数
        checkArgs(args) {
            if (!args.input) {
                console.error(`请设置 --input`);
                return false;
            }
            if (!fs__default["default"].existsSync(args.input)) {
                console.error(`输入路径不存在: ${args.input}`);
                return false;
            }
            return true;
        }
        parsePsdDir(dir, outDir) {
            return __awaiter(this, void 0, void 0, function* () {
                // 清空目录
                fs__default["default"].emptyDirSync(outDir);
                let psds = fileUtils.filterFile(dir, (fileName) => {
                    let extname = path__default["default"].extname(fileName);
                    if (extname == ".psd") {
                        return true;
                    }
                    return false;
                });
                for (let i = 0; i < psds.length; i++) {
                    const element = psds[i];
                    yield this.parsePsd(element, outDir);
                }
            });
        }
        parsePsd(psdPath, outDir) {
            return __awaiter(this, void 0, void 0, function* () {
                // 每开始一个新的 psd 清理掉上一个 psd 的图
                imageMgr.clear();
                this.textObjects.length = 0;
                console.log(`=========================================`);
                console.log(`处理 ${psdPath} 文件`);
                let psdName = path__default["default"].basename(psdPath, ".psd");
                let buffer = fs__default["default"].readFileSync(psdPath);
                const psdFile = psd__namespace.readPsd(buffer);
                let psdRoot = parser.parseLayer(psdFile);
                psdRoot.name = psdName;
                let prefabDir = path__default["default"].join(outDir, psdName);
                let textureDir = path__default["default"].join(prefabDir, "textures");
                fs__default["default"].mkdirsSync(prefabDir); // 创建预制体根目录
                fs__default["default"].emptyDirSync(prefabDir);
                fs__default["default"].mkdirsSync(textureDir); //创建 图片目录
                yield this.saveImage(textureDir);
                yield this.saveTextFile(psdRoot, prefabDir);
                console.log(`psd2ui ${psdPath} 处理完成`);
            });
        }
        saveImage(out) {
            let images = imageMgr.getAllImage();
            let idx = 0;
            images.forEach((psdImage, k) => {
                // 查找镜像
                let _layer = imageMgr.getSerialNumberImage(psdImage);
                let name = `${_layer.imgName}_${idx}`;
                console.log(`保存图片 [${_layer.imgName}] 重命名为 [${name}] md5: ${_layer.md5}`);
                let fullpath = path__default["default"].join(out, `${name}.png`);
                fs__default["default"].writeFileSync(fullpath, _layer.imgBuffer);
                idx++;
            });
        }
        saveTextFile(psdRoot, out) {
            this.scanText(psdRoot, psdRoot);
            let textContent = JSON.stringify(this.textObjects, null, 2);
            let fullpath = path__default["default"].join(out, `text.txt`);
            fs__default["default"].writeFileSync(fullpath, textContent, { encoding: "utf-8" });
        }
        scanText(layer, psdRoot) {
            if (layer instanceof PsdGroup) {
                for (let i = 0; i < layer.children.length; i++) {
                    const childLayer = layer.children[i];
                    this.scanText(childLayer, psdRoot);
                }
            }
            else if (layer instanceof PsdText) {
                let textObj = {
                    text: layer.text,
                    fontSize: layer.fontSize,
                    color: `#${layer.color.toHEX()}`
                };
                // 有描边
                if (layer.outline) {
                    textObj.outlineWidth = layer.outline.width;
                    textObj.outlineColor = `#${layer.outline.color.toHEX()}`;
                }
                this.textObjects.push(textObj);
            }
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new ExportImageMgr();
            }
            return this._instance;
        }
    }
    ExportImageMgr._instance = null;
    let exportImageMgr = ExportImageMgr.getInstance();

    // 3.4.x
    let CCUIOpacity = class CCUIOpacity extends CCComponent {
        constructor() {
            super(...arguments);
            this._opacity = 255;
        }
        updateWithLayer(psdLayer) {
        }
    };
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCUIOpacity.prototype, "_opacity", void 0);
    CCUIOpacity = __decorate([
        cctype("cc.UIOpacity")
    ], CCUIOpacity);

    // 3.4.x
    let CCUITransform = class CCUITransform extends CCComponent {
        constructor() {
            super(...arguments);
            this._contentSize = new CCSize();
            this._anchorPoint = new CCVec2(0, 0);
        }
        updateWithLayer(psdLayer) {
        }
    };
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCUITransform.prototype, "_contentSize", void 0);
    __decorate([
        ccversion(EditorVersion.v342)
    ], CCUITransform.prototype, "_anchorPoint", void 0);
    CCUITransform = __decorate([
        cctype("cc.UITransform")
    ], CCUITransform);

    //ag-psd 使用 参考 https://github.com/Agamnentzar/ag-psd/blob/HEAD/README_PSD.md
    /***
     * 执行流程
     * - 首次运行，先读取项目文件夹下所有图片资源，进行 md5 缓存
     *
     * - 加载缓存文件
     * - 处理 psd
     * - 通过 md5 判断是否已经存在资源，如果存在， 则不再导出，预制体中使用已存在的资源的 uuid
     *
     */
    console.log(`当前目录： `, __dirname);
    class Main {
        constructor() {
            this.spriteFrameMetaContent = "";
            this.prefabMetaContent = "";
            this.psdConfig = null;
            // 强制导出图片
            this.isForceImg = false;
        }
        test() {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Main-> test`);
            });
        }
        // 首先加载 meta 模板
        loadMetaTemplete() {
            return __awaiter(this, void 0, void 0, function* () {
                this.spriteFrameMetaContent = fs__default["default"].readFileSync(path__default["default"].join(__dirname, `../assets/cc/meta/CCSpriteFrame.meta.${EditorVersion[config.editorVersion]}`), "utf-8");
                this.prefabMetaContent = fs__default["default"].readFileSync(path__default["default"].join(__dirname, `../assets/cc/meta/CCPrefab.meta.${EditorVersion[config.editorVersion]}`), "utf-8");
            });
        }
        // 加载配置
        loadPsdConfig(filepath) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!fs__default["default"].existsSync(filepath)) {
                    console.log(`Main-> 配置 ${filepath} 不存在`);
                    return;
                }
                let psdConfig = fs__default["default"].readFileSync(filepath, "utf-8");
                this.psdConfig = JSON.parse(psdConfig);
                // 合并配置
                for (const key in this.psdConfig) {
                    if (key in config) {
                        if (typeof this.psdConfig[key] === 'object') {
                            config[key] = Object.assign({}, config[key], this.psdConfig[key]);
                        }
                        else {
                            config[key] = this.psdConfig[key] || config[key];
                        }
                    }
                }
            });
        }
        exec(args) {
            return __awaiter(this, void 0, void 0, function* () {
                args = mergeAlias(args);
                if (args.help) {
                    console.log(`help:\n`, config.help);
                    return false;
                }
                // 只导出图片
                if (args["img-only"]) {
                    exportImageMgr.exec(args);
                    return true;
                }
                let writeCache = () => __awaiter(this, void 0, void 0, function* () {
                    // 写入缓存
                    if (args.cache) {
                        fs__default["default"].mkdirsSync(path__default["default"].dirname(args.cache));
                        yield imageCacheMgr.saveImageMap(args.cache);
                    }
                });
                // 设置引擎版本
                if (args["engine-version"]) {
                    config.editorVersion = EditorVersion[args["engine-version"]];
                }
                console.log(`Main-> 数据版本 ${EditorVersion[config.editorVersion]}`);
                if (args.init && (!args["project-assets"] || !args.cache)) {
                    console.log(`psd2ui --init 无法处理，请设置 --project-assets`);
                    return;
                }
                // 创建缓存文件
                if (args.cache && !fs__default["default"].existsSync(args.cache)) {
                    yield writeCache();
                }
                // 在没有缓存文件或者 指定重新缓存的时候，读取项目资源
                if (args["project-assets"] && (args["cache-remake"] || args.init)) {
                    yield imageCacheMgr.loadImages(args["project-assets"]);
                    // 先写入一次
                    writeCache();
                    if (args.init) {
                        console.log(`psd2ui 缓存完成`);
                        return;
                    }
                }
                // 检查参数
                if (!this.checkArgs(args)) {
                    return;
                }
                if (args.cache) {
                    yield imageCacheMgr.initWithPath(args.cache);
                }
                // 加载 meta 文件模板
                yield this.loadMetaTemplete();
                if (args.config) {
                    yield this.loadPsdConfig(args.config);
                }
                this.isForceImg = !!args["force-img"];
                PsdLayer.isPinyin = args.pinyin;
                // 判断输入是文件夹还是文件
                let stat = fs__default["default"].lstatSync(args.input);
                let isDirectory = stat.isDirectory();
                if (isDirectory) {
                    if (!args.output) {
                        args.output = path__default["default"].join(args.input, "psd2ui");
                    }
                    this.parsePsdDir(args.input, args.output);
                }
                else {
                    if (!args.output) {
                        let input_dir = path__default["default"].dirname(args.input);
                        args.output = path__default["default"].join(input_dir, "psd2ui");
                    }
                    this.parsePsd(args.input, args.output);
                }
                // 写入缓存
                yield writeCache();
                console.log(`psd2ui 导出完成`);
            });
        }
        // 检查参数
        checkArgs(args) {
            if (!args.input) {
                console.error(`请设置 --input`);
                return false;
            }
            if (!fs__default["default"].existsSync(args.input)) {
                console.error(`输入路径不存在: ${args.input}`);
                return false;
            }
            if (args["engine-version"]) {
                let editorVersion = EditorVersion[args["engine-version"]];
                switch (editorVersion) {
                    case EditorVersion.v249:
                    case EditorVersion.v342:
                        break;
                    default:
                        console.log(`暂未实现该引擎版本 ${args["engine-version"]}`);
                        return false;
                }
            }
            return true;
        }
        parsePsdDir(dir, outDir) {
            return __awaiter(this, void 0, void 0, function* () {
                // 清空目录
                // fs.emptyDirSync(outDir);
                let psds = fileUtils.filterFile(dir, (fileName) => {
                    let extname = path__default["default"].extname(fileName);
                    if (extname == ".psd") {
                        return true;
                    }
                    return false;
                });
                for (let i = 0; i < psds.length; i++) {
                    const element = psds[i];
                    yield this.parsePsd(element, outDir);
                }
            });
        }
        parsePsd(psdPath, outDir) {
            return __awaiter(this, void 0, void 0, function* () {
                // 每开始一个新的 psd 清理掉上一个 psd 的图
                imageMgr.clear();
                console.log(`=========================================`);
                console.log(`处理 ${psdPath} 文件`);
                let psdName = path__default["default"].basename(psdPath, ".psd");
                let buffer = fs__default["default"].readFileSync(psdPath);
                const psdFile = psd__namespace.readPsd(buffer);
                let psdRoot = parser.parseLayer(psdFile);
                psdRoot.name = psdName;
                let prefabDir = path__default["default"].join(outDir, psdName);
                let textureDir = path__default["default"].join(prefabDir, "textures");
                fs__default["default"].mkdirsSync(prefabDir); // 创建预制体根目录
                // fs.emptyDirSync(prefabDir);
                fs__default["default"].mkdirsSync(textureDir); //创建 图片目录
                yield this.saveImage(textureDir);
                yield this.buildPrefab(psdRoot);
                yield this.savePrefab(psdRoot, prefabDir);
                console.log(`psd2ui ${psdPath} 处理完成`);
            });
        }
        buildPrefab(psdRoot) {
            let prefab = new CCPrefab();
            psdRoot.pushObject(prefab);
            let data = this.createCCNode(psdRoot, psdRoot);
            prefab.data = { __id__: data.idx };
            // 后期处理
            this.postUIObject(psdRoot, psdRoot);
        }
        createCCNode(layer, psdRoot) {
            let node = new CCNode(psdRoot);
            layer.uiObject = node;
            node._name = layer.name; //layer.attr?.name || layer.name;
            node._active = !layer.hidden;
            node._opacity = layer.opacity;
            if (config.editorVersion >= EditorVersion.v342) {
                // 3.4.x
                if (layer.opacity !== 255) {
                    let uiOpacity = new CCUIOpacity();
                    uiOpacity._opacity = layer.opacity;
                    uiOpacity.updateWithLayer(layer);
                    node.addComponent(uiOpacity);
                }
            }
            // 劫持尺寸设置，使用 psd 中配置的尺寸，这里不对原数据进行修改
            let size = new CCSize(layer.size.width, layer.size.height);
            // if (layer.attr?.comps.size) {
            //     let _attrSize = layer.attr.comps.size;
            //     size.width = _attrSize.w ?? size.width;
            //     size.height = _attrSize.h ?? size.height;
            // }
            // // 对缩放进行处理
            // size.width = Math.round(Math.abs(size.width / layer.scale.x));
            // size.height = Math.round(Math.abs(size.height / layer.scale.y));
            // 配置的位置 Y 偏移
            let offsetY = 0;
            if (layer instanceof PsdText) {
                offsetY = layer.offsetY;
            }
            node._contentSize = size;
            // 更新一下位置 // 根据图层名字设置 锚点，位置， 因为没有对原始数据进行修改，所以这里不考虑 缩放
            layer.updatePositionWithAR();
            // 2.4.9
            node._trs.setPosition(layer.position.x, layer.position.y + offsetY, 0);
            node._trs.setRotation(0, 0, 0, 1);
            node._trs.setScale(layer.scale.x, layer.scale.y, layer.scale.z);
            node._anchorPoint = new CCVec2(layer.anchorPoint.x, layer.anchorPoint.y);
            if (config.editorVersion >= EditorVersion.v342) {
                // 3.4.x
                node._lpos = new CCVec3(layer.position.x, layer.position.y + offsetY, 0);
                node._lrot = new CCVec3(0, 0, 0);
                node._lscale = new CCVec3(layer.scale.x, layer.scale.y, layer.scale.z);
                node._euler = new CCVec3();
                // 3.4.x
                let uiTransform = new CCUITransform();
                uiTransform._contentSize = size;
                uiTransform._anchorPoint = node._anchorPoint;
                uiTransform.updateWithLayer(layer);
                node.addComponent(uiTransform);
            }
            // 
            if (layer instanceof PsdGroup) {
                for (let i = 0; i < layer.children.length; i++) {
                    const childLayer = layer.children[i];
                    let childNode = this.createCCNode(childLayer, psdRoot);
                    childNode && node.addChild(childNode);
                }
            }
            else if (layer instanceof PsdImage) {
                let sprite = new CCSprite();
                node.addComponent(sprite);
                sprite._materials.push({
                    __uuid__: config.SpriteFrame_Material
                });
                sprite.updateWithLayer(layer);
                if (layer.isIgnore()) ;
                else {
                    // 查找绑定的图像
                    let _layer = imageMgr.getSerialNumberImage(layer);
                    // 根据原始图片自动计算缩放
                    let scaleX = layer.textureSize.width / _layer.textureSize.width;
                    let scaleY = layer.textureSize.height / _layer.textureSize.height;
                    if (scaleX != 1 || scaleY != 1) {
                        layer.scale = new Vec3((layer.isFlipX() ? -1 : 1) * scaleX, (layer.isFlipY() ? -1 : 1) * scaleY, 1);
                        node._trs.setScale(layer.scale.x, layer.scale.y, layer.scale.z);
                        node._lscale = new CCVec3(layer.scale.x, layer.scale.y, layer.scale.z);
                    }
                    // 使用已缓存的 图片 的 uuid
                    let imageWarp = imageCacheMgr.get(_layer.md5);
                    sprite.setSpriteFrame(imageWarp ? imageWarp.textureUuid : _layer.textureUuid);
                }
                this.applyConfig(sprite);
            }
            else if (layer instanceof PsdText) {
                let label = new CCLabel();
                node.addComponent(label);
                node._color.set(layer.color);
                label._color.set(layer.color);
                label._materials.push({
                    __uuid__: config.Label_Material
                });
                label.updateWithLayer(layer);
                this.applyConfig(label);
                // 有描边
                if (layer.outline) {
                    let labelOutline = new CCLabelOutline();
                    node.addComponent(labelOutline);
                    labelOutline.updateWithLayer(layer);
                    this.applyConfig(labelOutline);
                }
            }
            // Button / Toggle / ProgressBar
            if (layer.attr) {
                for (const key in layer.attr.comps) {
                    if (Object.prototype.hasOwnProperty.call(layer.attr.comps, key) && layer.attr.comps[key]) {
                        let ctor = config.CompMappings[key];
                        if (ctor) {
                            let comp = new ctor();
                            node.addComponent(comp);
                            comp.updateWithLayer(layer);
                            this.applyConfig(comp);
                        }
                    }
                }
            }
            this.createPrefabInfo(layer, psdRoot);
            return node;
        }
        createPrefabInfo(layer, psdRoot) {
            let node = layer.uiObject;
            let prefabInfo = new CCPrefabInfo();
            let idx = psdRoot.pushObject(prefabInfo);
            node._prefab = { __id__: idx };
        }
        // 后处理
        postUIObject(layer, psdRoot) {
        }
        saveImage(out) {
            let images = imageMgr.getAllImage();
            images.forEach((psdImage, k) => {
                // 查找镜像
                let _layer = imageMgr.getSerialNumberImage(psdImage);
                // 查找已缓存的相同图像
                let imageWarp = imageCacheMgr.get(_layer.md5);
                // 不是强制导出的话，判断是否已经导出过
                if (!this.isForceImg) {
                    // 判断是否已经导出过相同 md5 的资源，不再重复导出
                    if (imageWarp === null || imageWarp === void 0 ? void 0 : imageWarp.isOutput) {
                        console.log(`已有相同资源，不再导出 [${psdImage.imgName}]  md5: ${psdImage.md5}`);
                        return;
                    }
                }
                console.log(`保存图片 [${_layer.imgName}] md5: ${_layer.md5}`);
                imageWarp && (imageWarp.isOutput = true);
                let fullPath = path__default["default"].join(out, `${_layer.imgName}.png`);
                fs__default["default"].writeFileSync(fullPath, _layer.imgBuffer);
                this.saveImageMeta(_layer, fullPath);
            });
        }
        saveImageMeta(layer, fullPath) {
            let _layer = imageMgr.getSerialNumberImage(layer);
            let imageWarp = imageCacheMgr.get(_layer.md5);
            if (!imageWarp) {
                imageWarp = _layer;
            }
            // 2.4.9 =-> SPRITE_FRAME_UUID
            let meta = this.spriteFrameMetaContent.replace(/\$SPRITE_FRAME_UUID/g, imageWarp.uuid);
            meta = meta.replace(/\$TEXTURE_UUID/g, imageWarp.textureUuid);
            meta = meta.replace(/\$FILE_NAME/g, _layer.imgName);
            meta = meta.replace(/\$WIDTH/g, _layer.textureSize.width);
            meta = meta.replace(/\$HEIGHT/g, _layer.textureSize.height);
            let s9 = _layer.s9 || {
                b: 0, t: 0, l: 0, r: 0,
            };
            meta = meta.replace(/\$BORDER_TOP/g, s9.t);
            meta = meta.replace(/\$BORDER_BOTTOM/g, s9.b);
            meta = meta.replace(/\$BORDER_LEFT/g, s9.l);
            meta = meta.replace(/\$BORDER_RIGHT/g, s9.r);
            fs__default["default"].writeFileSync(fullPath + `.meta`, meta);
        }
        savePrefab(psdDoc, out) {
            let fullpath = path__default["default"].join(out, `${psdDoc.name}.prefab`);
            fs__default["default"].writeFileSync(fullpath, JSON.stringify(psdDoc.objectArray, null, 2));
            this.savePrefabMeta(psdDoc, fullpath);
        }
        savePrefabMeta(psdDoc, fullpath) {
            let meta = this.prefabMetaContent.replace(/\$PREFB_UUID/g, psdDoc.uuid);
            fs__default["default"].writeFileSync(fullpath + `.meta`, meta);
        }
        applyConfig(comp) {
            if (!this.psdConfig) {
                return;
            }
            if (comp.__type__ in this.psdConfig) {
                let compConfig = this.psdConfig[comp.__type__];
                for (const key in compConfig) {
                    if (Object.prototype.hasOwnProperty.call(compConfig, key)) {
                        const element = compConfig[key];
                        comp[key] = element;
                    }
                }
            }
        }
    }
    /** 合并别名 */
    function mergeAlias(args) {
        // 如果是 json 对象参数
        if (args.json) {
            let base64 = args.json;
            // 解码 json 
            args = JSON.parse(Buffer.from(base64, "base64").toString());
            // // 编码
            // let jsonContent = JSON.stringify(args);
            // let base64 = Buffer.from(jsonContent).toString("base64");
        }
        args.help = args.help || args.h;
        args.input = args.input || args.in;
        args.output = args.output || args.out;
        args["engine-version"] = args["engine-version"] || args.ev;
        args["project-assets"] = args["project-assets"] || args.p;
        args["cache-remake"] = args["cache-remake"] || args.crm;
        args["force-img"] = args["force-img"] || args.fimg;
        args.pinyin = args.pinyin || args.py;
        args.cache = args.cache || args.c;
        args.init = args.init || args.i;
        args.config = args.config;
        return args;
    }

    // ##################
    // 输入
    const oldArgs = process.argv.slice(2);
    const args = minimist__default["default"](oldArgs);
    let main = new Main();
    if (oldArgs.length) {
        main.exec(args);
    }
    else {
        // 测试
        main.test();
    }
    // ##################

}));
