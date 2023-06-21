"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const xlsx = __importStar(require("xlsx"));
const utils_1 = require("./utils");
const EXCLUDE_KEY = "exclude";
const BOTH_KEY = "both";
const defaultConfig = {
    desc: 2,
    type: 3,
    platform: 4,
    key: 5
};
const defaultParseWorkBookOptions = { exportPlatform: "client" };
class Parse {
    constructor() {
        this.customConvert = null;
        this.parseWorkBookOptions = null;
    }
    /**
     * 解析整个工作簿
     *
     * @param {xlsx.WorkBook} workBook
     * @param {ParseWorkBookOptions} [options]
     * @return {*}  {WorkBookData}
     * @memberof Parse
     */
    parseWorkBook(workBook, workBookName, options) {
        this.parseWorkBookOptions = options || defaultParseWorkBookOptions;
        let workBookData = {};
        let name = workBook.SheetNames[0]; // 只读取第一个表
        // Object.keys(workBook.Sheets).forEach((name) => {
        let sheet = workBook.Sheets[name];
        let data = xlsx.utils.sheet_to_json(sheet, {
            header: 1,
            raw: true,
        });
        // 第一行第一个格子强制填写 主键 第二个格子为 当前表的可选配置
        let config = defaultConfig;
        let customSettings = null; // 自定义配置
        let settings = {};
        if (data.length) {
            let primaryKey = data[0][0];
            let mainSettings = data[0][1];
            customSettings = data[0][2]; // 自定义配置
            let primaryKeys = primaryKey === null || primaryKey === void 0 ? void 0 : primaryKey.split(",");
            let primaryKeyIndexs = [];
            let excludeIndexs = [];
            if (mainSettings) {
                try {
                    config = (0, utils_1.toObject)(mainSettings);
                }
                catch (error) {
                    console.log(error);
                }
            }
            let keyIdx = 0;
            let keyRow = data[config.key - 1];
            let platformRow = data[config.platform - 1];
            let typeRow = data[config.type - 1];
            let rowLength = Math.max(platformRow.length, keyRow.length, typeRow.length);
            let checkKey = {};
            for (let i = 0; i < rowLength; i++) {
                const keyCell = keyRow[i];
                const platformCell = platformRow[i];
                const typeCell = typeRow[i];
                let isExclude = false;
                if (keyCell === undefined || keyCell === null) {
                    isExclude = true;
                    console.error(`表格: ${name}, 检查到 [${config.key},${i}], 键不存在`);
                }
                else {
                    if (checkKey[keyCell]) {
                        console.error(`表格: ${name}, 检查到重复的键 [${config.key},${i}], 键为: `, keyCell, "排除数据");
                        isExclude = true;
                    }
                    checkKey[keyCell] = true;
                    if (primaryKeys && keyIdx !== primaryKeys.length) {
                        if (primaryKeys[keyIdx] === keyCell) {
                            primaryKeyIndexs.push(i);
                            keyIdx++;
                        }
                    }
                }
                if (typeCell === undefined || typeCell === null) {
                    isExclude = true;
                    // typeRow[i] = "err";
                    console.error(`表格: ${name}, 检查到 [${config.type},${i}], 类型不存在`);
                }
                if (platformCell === undefined || platformCell === null) {
                    isExclude = isExclude || false;
                    console.error(`表格: ${name}, 检查到 [${config.platform},${i}], 导出平台不存在，排除数据: ${isExclude}`);
                }
                else {
                    const val = platformCell.toString().trim().toLowerCase();
                    const exportPlatform = this.parseWorkBookOptions.exportPlatform.toLowerCase();
                    if (val === BOTH_KEY) {
                        // 所有平台都导出
                    }
                    else {
                        // 非指定平台进行排除导出
                        if (val === EXCLUDE_KEY || exportPlatform !== val) {
                            isExclude = true;
                        }
                    }
                }
                if (isExclude) {
                    excludeIndexs.push(i);
                }
            }
            let head = 0; // 数据开始行数
            for (const key in config) {
                head = Math.max(head, config[key]);
                settings[key] = JSON.parse(JSON.stringify(data[config[key] - 1]));
            }
            settings = Object.assign(settings, { config, primaryKeys, primaryKeyIndexs, excludeIndexs, head });
        }
        workBookData[workBookName] = {
            name: workBookName, data, settings, config, customConfig: customSettings
        };
        // });
        return workBookData;
    }
    convertWorkBook(workBook, customConvert) {
        let result = {};
        this.customConvert = customConvert;
        Object.keys(workBook).forEach((name) => {
            var _a;
            if (name.startsWith("!")) {
                return;
            }
            console.log(`开始转换表格: ${name}`);
            const sheet = workBook[name];
            let data = (_a = customConvert === null || customConvert === void 0 ? void 0 : customConvert.customConvertSheet(sheet)) !== null && _a !== void 0 ? _a : this.convertSheet(sheet);
            if (typeof data === 'string') {
                sheet.text = data;
                result[sheet.name] = sheet;
            }
            else if (typeof data === 'object') {
                for (const key in data) {
                    let copySheet = JSON.parse(JSON.stringify(sheet));
                    copySheet.name = key;
                    copySheet.text = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
                    result[key] = copySheet;
                }
            }
        });
        return result;
    }
    /**
     * 删除需要排除的数据
     *
     * @param {SheetData} sheet
     * @memberof Parse
     */
    deleteExcludeData(sheet) {
        let settings = sheet.settings;
        for (let j = settings.excludeIndexs.length; j--;) {
            for (let i = 0, length = sheet.data.length; i < length; i++) {
                let row = sheet.data[i];
                row.splice(settings.excludeIndexs[j], 1);
            }
        }
        for (const key in settings.config) {
            settings[key] = JSON.parse(JSON.stringify(sheet.data[settings.config[key] - 1]));
        }
    }
    convertSheet(sheet) {
        let settings = sheet.settings;
        sheet.extname = ".json";
        this.deleteExcludeData(sheet);
        let result = {};
        for (let i = settings.head, length = sheet.data.length; i < length; i++) {
            let row = sheet.data[i];
            let rowData = this.convertRow(row, i, settings);
            result[rowData.primaryKey] = rowData.data;
        }
        return JSON.stringify(result);
    }
    convertRow(row, rowIndex, settings) {
        let rowResult = {};
        let primaryKey = this.formatPrimaryKey(row, settings);
        let length = Math.max(settings.key.length, settings.type.length, settings.platform.length, row.length);
        for (let j = 0; j < length; j++) {
            const key = settings.key[j];
            const type = settings.type[j];
            // if (settings.excludeIndexs.includes(j)) {
            //     continue;
            // }
            const cell = this.convertCell(row[j], rowIndex, j, key, type);
            if (rowResult[key]) {
                console.error(`已有相同键:[${rowIndex + 1},${j}], key: [${key}], data: [${rowResult[key]}]`);
            }
            rowResult[key] = cell;
        }
        return { primaryKey, data: rowResult };
    }
    /** 格式化主键 */
    formatPrimaryKey(row, settings) {
        let keyArray = [];
        for (let k = 0; k < settings.primaryKeyIndexs.length; k++) {
            const idx = settings.primaryKeyIndexs[k];
            keyArray.push(row[idx]);
        }
        let primaryKey = keyArray.join("_");
        return primaryKey;
    }
    convertCell(cell, rowIndex, cellIndex, name, type) {
        if (!name) {
            return null;
        }
        if (name.toString().startsWith("!")) {
            return null;
        }
        // if (cell === null || cell === undefined) {
        //     cell = "";
        // }
        let rowID = rowIndex + 1;
        if (!type) {
            console.warn(`type is [undefind] at [${rowID},  ${cellIndex}],key: [${name}] data: `, cell);
            return null;
        }
        let result = null;
        switch (type) {
            case utils_1.DataType.AUTO:
                result = (0, utils_1.parseAuto)(cell);
                break;
            case utils_1.DataType.NUMBER:
                if ((0, utils_1.isNumber)(cell)) {
                    result = Number(cell);
                }
                else {
                    result = 0;
                    console.warn(`type error at [${rowID}, ${cellIndex}] ` + cell + " is not a number");
                }
                break;
            case utils_1.DataType.NUM_ARRAY:
                result = (0, utils_1.toArray)(cell);
                if (result == null) {
                    console.error(`parse Object err [${rowID},${cellIndex}], key: [${name}], data: `, cell);
                }
                break;
            case utils_1.DataType.STRING:
                result = cell ? cell.toString() : "";
                break;
            case utils_1.DataType.STR_ARRAY:
                result = (0, utils_1.toStringArray)(cell);
                break;
            case utils_1.DataType.BOOL:
                result = (0, utils_1.toBoolean)(cell);
                break;
            case utils_1.DataType.BOOL_ARRAY:
                result = (0, utils_1.toBoolArray)(cell);
                break;
            case utils_1.DataType.OBJECT:
                result = (0, utils_1.toObject)(cell);
                if (result == null) {
                    console.error(`parse Object err [${rowID},${cellIndex}],key: [${name}], data: `, cell);
                }
                break;
            case utils_1.DataType.ARRAY:
                result = (0, utils_1.toArray)(cell);
                if (result == null) {
                    console.error(`parse Object err [${rowID},${cellIndex}], key: [${name}], data: `, cell);
                }
                break;
            default:
                result = cell ? cell.toString() : "";
                // 特殊类型导出原始数据
                // 重定向以 # 作为标记
                break;
        }
        return result;
    }
    toDTS(sheet) {
        let settings = sheet.settings;
        let config = settings.config;
        let data = sheet.data;
        let keyRow = data[config.key - 1];
        let typeRow = data[config.type - 1];
        let result = `\tinterface ${sheet.name}{\n`;
        let rowLength = Math.max(keyRow.length, typeRow.length);
        for (let i = 0; i < rowLength; i++) {
            const keyCell = keyRow[i];
            const typeCell = typeRow[i];
            let type = "any;";
            switch (typeCell) {
                case utils_1.DataType.AUTO:
                    break;
                case utils_1.DataType.NUMBER:
                    type = "number;";
                    break;
                case utils_1.DataType.NUM_ARRAY:
                    type = "number[];";
                    break;
                case utils_1.DataType.STRING:
                    type = "string;";
                    break;
                case utils_1.DataType.STR_ARRAY:
                    type = "string[];";
                    break;
                case utils_1.DataType.BOOL:
                    type = "boolean;";
                    break;
                case utils_1.DataType.BOOL_ARRAY:
                    type = "boolean[];";
                    break;
                case utils_1.DataType.OBJECT:
                    type = "any;";
                    break;
                case utils_1.DataType.ARRAY:
                    type = "any[];";
                    break;
                default:
                    console.log(`parse-> `);
                    if (typeCell.includes("#")) {
                        let arr = typeCell.split("#");
                        type = arr[1] || "any;";
                    }
                    break;
            }
            result += `\t\t${keyCell}: ${type}\n`;
        }
        result += "\t}\n";
        return result;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new Parse();
        }
        return this._instance;
    }
}
Parse._instance = null;
exports.parse = Parse.getInstance();
