"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCNode = void 0;
const config_1 = require("../../config");
const EditorVersion_1 = require("../../EditorVersion");
const _decorator_1 = require("../../_decorator");
const CCCompPrefabInfo_1 = require("./CCCompPrefabInfo");
const CCObject_1 = require("./CCObject");
const CCColor_1 = require("./values/CCColor");
const CCSize_1 = require("./values/CCSize");
const CCTypedArray_1 = require("./values/CCTypedArray");
const CCVec2_1 = require("./values/CCVec2");
const CCVec3_1 = require("./values/CCVec3");
let CCNode = class CCNode extends CCObject_1.CCObject {
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
        this._color = new CCColor_1.CCColor(255, 255, 255, 255);
        // 2.4.x
        this._contentSize = new CCSize_1.CCSize();
        // 2.4.x
        this._anchorPoint = new CCVec2_1.CCVec2(0, 0);
        // 2.4.x
        this._trs = new CCTypedArray_1.CCTypedArray();
        // 2.4.x
        this._eulerAngles = new CCVec3_1.CCVec3();
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
        this._lpos = new CCVec3_1.CCVec3();
        // 3.4.x
        this._lrot = new CCVec3_1.CCVec3();
        // 3.4.x
        this._lscale = new CCVec3_1.CCVec3();
        // 3.4.x
        this._euler = new CCVec3_1.CCVec3();
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
        if (config_1.config.editorVersion >= EditorVersion_1.EditorVersion.v342) {
            this.addCompPrefabInfo(comp);
        }
    }
    addCompPrefabInfo(comp) {
        let compInfo = new CCCompPrefabInfo_1.CCCompPrefabInfo();
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
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCNode.prototype, "_parent", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCNode.prototype, "_children", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCNode.prototype, "_active", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCNode.prototype, "_components", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCNode.prototype, "_prefab", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.all)
], CCNode.prototype, "_id", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_opacity", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_color", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_contentSize", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_anchorPoint", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_trs", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_eulerAngles", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_skewX", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_skewY", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_is3DNode", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_groupIndex", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "groupIndex", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_renderEnable", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v249)
], CCNode.prototype, "_bfsRenderFlag", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCNode.prototype, "_lpos", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCNode.prototype, "_lrot", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCNode.prototype, "_lscale", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCNode.prototype, "_euler", void 0);
__decorate([
    (0, _decorator_1.ccversion)(EditorVersion_1.EditorVersion.v342)
], CCNode.prototype, "_layer", void 0);
__decorate([
    _decorator_1.nonserialization
], CCNode.prototype, "psdDoc", void 0);
__decorate([
    _decorator_1.nonserialization
], CCNode.prototype, "components", void 0);
__decorate([
    _decorator_1.nonserialization
], CCNode.prototype, "children", void 0);
CCNode = __decorate([
    (0, _decorator_1.cctype)("cc.Node")
], CCNode);
exports.CCNode = CCNode;
