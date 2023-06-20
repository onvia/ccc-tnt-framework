"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomConvert2Json = void 0;
const parse_1 = require("../parse");
class CustomConvert2Json {
    customConvertSheet(sheet) {
        let settings = sheet.settings;
        sheet.extname = ".json";
        parse_1.parse.deleteExcludeData(sheet);
        // 多语言文档
        if (sheet.customConfig === "i18n") {
            let languages = {};
            for (let i = settings.head, length = sheet.data.length; i < length; i++) {
                let row = sheet.data[i];
                let primaryKey = parse_1.parse.formatPrimaryKey(row, settings);
                let rowData = this.customConvertRow(row, i, settings);
                // 跳过第 0 个
                for (let j = 1; j < settings.key.length; j++) {
                    const key = settings.key[j];
                    languages[key] = languages[key] || {};
                    languages[key][primaryKey] = rowData[j];
                }
            }
            return languages;
        }
        let result = {
            keys: settings.key,
            data: [],
            index: {},
            redirect: {},
        };
        for (let i = settings.head, length = sheet.data.length; i < length; i++) {
            let row = sheet.data[i];
            let primaryKey = parse_1.parse.formatPrimaryKey(row, settings);
            let rowData = this.customConvertRow(row, i, settings);
            if (rowData) {
                result.data.push(rowData);
                result.index[primaryKey] = i - settings.head;
            }
        }
        // 检查重定向
        for (let j = 0; j < settings.type.length; j++) {
            const type = settings.type[j];
            const key = settings.key[j];
            if (type.includes("#")) {
                let arr = type.split("#");
                if (arr[1]) {
                    result.redirect[key] = arr[1];
                }
            }
        }
        return JSON.stringify(result);
    }
    customConvertRow(row, rowIndex, settings) {
        let flags = {};
        let rowResult = [];
        let length = Math.max(settings.key.length, settings.type.length, settings.platform.length, row.length);
        for (let j = 0; j < length; j++) {
            const key = settings.key[j];
            const type = settings.type[j];
            const cell = parse_1.parse.convertCell(row[j], rowIndex, j, key, type);
            if (flags[key]) {
                console.error(`已有相同键:[${rowIndex + 1},${j}], key: [${key}], data: [${flags[key]}]`);
            }
            flags[key] = cell;
            rowResult[j] = cell;
        }
        return rowResult;
    }
}
exports.CustomConvert2Json = CustomConvert2Json;
