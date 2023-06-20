"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAuto = exports.toArray = exports.toObject = exports.toBoolArray = exports.toStringArray = exports.isBoolean = exports.isNumber = exports.toBoolean = exports.DataType = void 0;
var DataType;
(function (DataType) {
    DataType["NUMBER"] = "number";
    DataType["STRING"] = "string";
    DataType["BOOL"] = "bool";
    DataType["ARRAY"] = "array";
    DataType["NUM_ARRAY"] = "number[]";
    DataType["STR_ARRAY"] = "string[]";
    DataType["BOOL_ARRAY"] = "bool[]";
    DataType["OBJECT"] = "object";
    DataType["AUTO"] = "auto";
})(DataType = exports.DataType || (exports.DataType = {}));
function toBoolean(value) {
    if (typeof (value) === 'undefined') {
        return false;
    }
    let isTrue = false;
    let _case = value.toString().trim().toLowerCase();
    if (_case === 'true') {
        isTrue = true;
    }
    else if (_case === 'false') {
        isTrue = false;
    }
    else {
        console.error(`toBoolean error: [${value}]`);
    }
    return isTrue;
}
exports.toBoolean = toBoolean;
function isNumber(value) {
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value === 'undefined' || value === null) {
        return false;
    }
    return (!isNaN(parseFloat(value)) && isFinite(value));
}
exports.isNumber = isNumber;
function isBoolean(value) {
    if (typeof (value) === "undefined") {
        return false;
    }
    if (typeof value === 'boolean') {
        return true;
    }
    let b = value.toString().trim().toLowerCase();
    return b === 'true' || b === 'false';
}
exports.isBoolean = isBoolean;
function toStringArray(data) {
    if (typeof (data) === "undefined") {
        return [];
    }
    let datas = data.split(",");
    datas = datas.map((res) => {
        res = res.toString().trim();
        return res.trim();
    });
    return datas;
}
exports.toStringArray = toStringArray;
function toBoolArray(data) {
    if (typeof (data) === "undefined") {
        return [];
    }
    let datas = data.split(",");
    let result = datas.map((res) => {
        res = res.toString().trim();
        return toBoolean(res);
    });
    return result;
}
exports.toBoolArray = toBoolArray;
function toObject(data) {
    let results = {};
    if (typeof (data) === "undefined") {
        return results;
    }
    let json = data;
    if (!data.toString().startsWith("{")) {
        json = `{${data}}`;
    }
    try {
        // 首先尝试正常的对象解析
        results = eval("(" + json + ")");
    }
    catch (error) {
        try {
            let datas = data.split(",");
            datas.forEach((res) => {
                let kvs = res.split(":");
                kvs.map((kv) => {
                    return kv.trim();
                });
                if (kvs.length >= 2) {
                    results[kvs[0]] = parseAuto(kvs[1]);
                }
            });
        }
        catch (error) {
            results = null;
        }
    }
    return results;
}
exports.toObject = toObject;
function toArray(data) {
    let results = [];
    if (typeof (data) === "undefined") {
        return results;
    }
    let json = data;
    if (!data.toString().startsWith("[")) {
        json = `[${data}]`;
    }
    try {
        // 首先尝试正常的数组解析
        results = eval("(" + json + ")");
    }
    catch (error) {
        try {
            let datas = data.split(",");
            results = datas.map((res) => {
                let result = parseAuto(res);
                return result;
            });
        }
        catch (error) {
            results = null;
        }
    }
    return results;
}
exports.toArray = toArray;
function parseAuto(res) {
    if (typeof (res) === "undefined") {
        return "";
    }
    res = res.toString().trim();
    let result = null;
    if (res.match(/\"|\'/g)) {
        res = res.replace(/\"|\'/g, "");
    }
    if (isNumber(res)) {
        result = Number(res);
    }
    else if (isBoolean(res)) {
        result = toBoolean(res);
    }
    else {
        // TODO 解析复杂对象，数组
        result = res;
    }
    return result;
}
exports.parseAuto = parseAuto;
