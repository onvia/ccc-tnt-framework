"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomConvertLanguage2Json = void 0;
const path_1 = __importDefault(require("path"));
const parse_1 = require("../parse");
const file_utils_1 = require("../utils/file-utils");
class CustomConvertLanguage2Json {
    customConvertSheet(sheet) {
        let settings = sheet.settings;
        sheet.extname = ".json";
        parse_1.parse.deleteExcludeData(sheet);
        // 多语言文档
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
    saveFile(data, outDir) {
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            let fullpath = path_1.default.join(outDir, `${name}${sheet.extname}`);
            file_utils_1.fileUtils.writeFile(fullpath, sheet.text);
        });
    }
    saveDeclarationDoc(data, outDir) {
        let keys = Object.keys(data);
        if (!keys.length) {
            return;
        }
        let name = keys[0];
        const sheet = data[name];
        let json = JSON.parse(sheet.text);
        let filename = `language.d.ts`;
        outDir = path_1.default.resolve(outDir);
        if (outDir.includes(".")) {
            filename = path_1.default.basename(outDir);
            outDir = path_1.default.dirname(outDir);
        }
        // 生成 dts
        let dts = `declare global {\n`;
        dts += `\tinterface LanguageKeyType{\n`;
        for (const key in json) {
            dts += `\t\t"${key}": string;\n`;
        }
        dts += '\t}\n';
        dts += '}\n';
        dts += `export { };\n\n`;
        file_utils_1.fileUtils.writeFile(path_1.default.join(outDir, filename), dts);
    }
}
exports.CustomConvertLanguage2Json = CustomConvertLanguage2Json;
