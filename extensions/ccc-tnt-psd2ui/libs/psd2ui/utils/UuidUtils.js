"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UuidUtils = void 0;
var Uuid = require('node-uuid');
var Base64KeyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var AsciiTo64 = new Array(128);
for (var i = 0; i < 128; ++i) {
    AsciiTo64[i] = 0;
}
for (i = 0; i < 64; ++i) {
    AsciiTo64[Base64KeyChars.charCodeAt(i)] = i;
}
var Reg_Dash = /-/g;
var Reg_Uuid = /^[0-9a-fA-F-]{36}$/;
var Reg_NormalizedUuid = /^[0-9a-fA-F]{32}$/;
var Reg_CompressedUuid = /^[0-9a-zA-Z+/]{22,23}$/;
class UuidUtils {
    // 压缩后的 uuid 可以减小保存时的尺寸，但不能做为文件名（因为无法区分大小写并且包含非法字符）。
    // 默认将 uuid 的后面 27 位压缩成 18 位，前 5 位保留下来，方便调试。
    // fc991dd7-0033-4b80-9d41-c8a86a702e59 -> fc9913XADNLgJ1ByKhqcC5Z
    // 如果启用 min 则将 uuid 的后面 30 位压缩成 20 位，前 2 位保留不变。
    // fc991dd7-0033-4b80-9d41-c8a86a702e59 -> fcmR3XADNLgJ1ByKhqcC5Z
    /*
     * @param {Boolean} [min=false]
     */
    static compressUuid(uuid, min) {
        if (Reg_Uuid.test(uuid)) {
            uuid = uuid.replace(Reg_Dash, '');
        }
        else if (!Reg_NormalizedUuid.test(uuid)) {
            return uuid;
        }
        var reserved = (min === true) ? 2 : 5;
        return UuidUtils.compressHex(uuid, reserved);
    }
    static compressHex(hexString, reservedHeadLength) {
        var length = hexString.length;
        var i;
        if (typeof reservedHeadLength !== 'undefined') {
            i = reservedHeadLength;
        }
        else {
            i = length % 3;
        }
        var head = hexString.slice(0, i);
        var base64Chars = [];
        while (i < length) {
            var hexVal1 = parseInt(hexString[i], 16);
            var hexVal2 = parseInt(hexString[i + 1], 16);
            var hexVal3 = parseInt(hexString[i + 2], 16);
            base64Chars.push(Base64KeyChars[(hexVal1 << 2) | (hexVal2 >> 2)]);
            base64Chars.push(Base64KeyChars[((hexVal2 & 3) << 4) | hexVal3]);
            i += 3;
        }
        return head + base64Chars.join('');
    }
    static decompressUuid(str) {
        if (str.length === 23) {
            // decode base64
            var hexChars = [];
            for (var i = 5; i < 23; i += 2) {
                var lhs = AsciiTo64[str.charCodeAt(i)];
                var rhs = AsciiTo64[str.charCodeAt(i + 1)];
                hexChars.push((lhs >> 2).toString(16));
                hexChars.push((((lhs & 3) << 2) | rhs >> 4).toString(16));
                hexChars.push((rhs & 0xF).toString(16));
            }
            //
            str = str.slice(0, 5) + hexChars.join('');
        }
        else if (str.length === 22) {
            // decode base64
            var hexChars = [];
            for (var i = 2; i < 22; i += 2) {
                var lhs = AsciiTo64[str.charCodeAt(i)];
                var rhs = AsciiTo64[str.charCodeAt(i + 1)];
                hexChars.push((lhs >> 2).toString(16));
                hexChars.push((((lhs & 3) << 2) | rhs >> 4).toString(16));
                hexChars.push((rhs & 0xF).toString(16));
            }
            //
            str = str.slice(0, 2) + hexChars.join('');
        }
        return [str.slice(0, 8), str.slice(8, 12), str.slice(12, 16), str.slice(16, 20), str.slice(20)].join('-');
    }
    static isUuid(str) {
        return Reg_CompressedUuid.test(str) || Reg_NormalizedUuid.test(str) || Reg_Uuid.test(str);
    }
    static uuid() {
        var uuid = Uuid.v4();
        return UuidUtils.compressUuid(uuid, true);
    }
}
exports.UuidUtils = UuidUtils;
;
