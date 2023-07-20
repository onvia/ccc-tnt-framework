"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCCompPrefabInfo = void 0;
const Utils_1 = require("../../utils/Utils");
const UIObject_1 = require("../UIObject");
// @cctype("cc.CompPrefabInfo")
class CCCompPrefabInfo extends UIObject_1.UIObject {
    constructor() {
        super();
        this.__type__ = "cc.CompPrefabInfo";
        this.fileId = "";
        this.fileId = Utils_1.utils.compressUuid(this.uuid);
    }
}
exports.CCCompPrefabInfo = CCCompPrefabInfo;
