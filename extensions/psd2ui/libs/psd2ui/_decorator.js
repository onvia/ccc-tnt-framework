"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccversion = exports.cctype = exports.nonserialization = void 0;
const EditorVersion_1 = require("./EditorVersion");
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
exports.nonserialization = nonserialization;
function cctype(type) {
    return (target) => {
        Object.defineProperty(target.prototype, "$__type__", {
            value: type,
            enumerable: true,
        });
    };
}
exports.cctype = cctype;
let _extends = {};
let _class_attrs = {};
let _target_map_ = {};
let __verIdx = 0;
let _printID = -1;
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
        if (EditorVersion_1.EditorVersion.all === version) {
            for (const key in EditorVersion_1.EditorVersion) {
                _class_obj[propertyKey][EditorVersion_1.EditorVersion[key]] = true;
            }
        }
        else {
            _class_obj[propertyKey][EditorVersion_1.EditorVersion[version]] = true;
        }
        var base = getSuper(target.constructor);
        // (base === Object || base === UIObject) && (base = null);
        if (base) {
            let parent = checkTag(base.prototype);
            !_extends[_class_name_] && (_extends[_class_name_] = parent);
            var _super = getSuper(base);
            let superIdx = 1;
            while (_super) {
                // if(_super === Object || _super === UIObject) {
                //     // _super = null;
                //     break;
                // }
                let super_tag = checkTag(_super.prototype);
                !_extends[parent] && (_extends[parent] = super_tag);
                _super = getSuper(_super);
                superIdx++;
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
exports.ccversion = ccversion;
function getSuper(ctor) {
    var proto = ctor.prototype; // binded function do not have prototype
    var dunderProto = proto && Object.getPrototypeOf(proto);
    return dunderProto && dunderProto.constructor;
}
