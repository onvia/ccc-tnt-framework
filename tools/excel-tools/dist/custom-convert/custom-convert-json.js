"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomConvert2Json = void 0;
const path_1 = __importDefault(require("path"));
const parse_1 = require("../parse");
const file_utils_1 = require("../utils/file-utils");
class CustomConvert2Json {
    customConvertSheet(sheet) {
        let settings = sheet.settings;
        sheet.extname = ".json";
        parse_1.parse.deleteExcludeData(sheet);
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
    saveFile(data, outDir) {
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            let fullpath = path_1.default.join(outDir, `${name}${sheet.extname}`);
            file_utils_1.fileUtils.writeFile(fullpath, sheet.text);
        });
    }
    saveDeclarationDoc(data, outDir) {
        let filename = `tbl.d.ts`;
        outDir = path_1.default.resolve(outDir);
        if (outDir.includes(".")) {
            filename = path_1.default.basename(outDir);
            outDir = path_1.default.dirname(outDir);
        }
        // 生成 dts
        let dts = `declare global {\n`;
        dts += `\tnamespace tbl{\n`;
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            dts += parse_1.parse.toDTS(sheet);
        });
        dts += '\t}\n';
        dts += '}\n';
        dts += `export { };\n\n`;
        dts += `declare global {\n`;
        dts += `\tinterface ITbl {\n`;
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            dts += `\t\t${sheet.name}: GTbl<tbl.${sheet.name}>;\n`;
        });
        dts += `\t}\n`;
        dts += `}`;
        file_utils_1.fileUtils.writeFile(path_1.default.join(outDir, filename), dts);
    }
}
exports.CustomConvert2Json = CustomConvert2Json;
