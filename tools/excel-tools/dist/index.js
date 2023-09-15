(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('minimist'), require('xlsx'), require('fs-extra'), require('path'), require('crypto'), require('fast-xml-parser')) :
    typeof define === 'function' && define.amd ? define(['minimist', 'xlsx', 'fs-extra', 'path', 'crypto', 'fast-xml-parser'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.minimist, global.xlsx, global.fs, global.path, global.crypto, global.fastXmlParser));
})(this, (function (minimist, xlsx, fs, path, crypto, fastXmlParser) { 'use strict';

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
    var xlsx__namespace = /*#__PURE__*/_interopNamespace(xlsx);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

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
    })(DataType || (DataType = {}));
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
    function isNumber(value) {
        if (typeof value === 'number') {
            return true;
        }
        if (typeof value === 'undefined' || value === null) {
            return false;
        }
        return (!isNaN(parseFloat(value)) && isFinite(value));
    }
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
            let data = xlsx__namespace.utils.sheet_to_json(sheet, {
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
                        config = toObject(mainSettings);
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
                        if (val === BOTH_KEY) ;
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
                case DataType.AUTO:
                    result = parseAuto(cell);
                    break;
                case DataType.NUMBER:
                    if (isNumber(cell)) {
                        result = Number(cell);
                    }
                    else {
                        result = 0;
                        console.warn(`type error at [${rowID}, ${cellIndex}] ` + cell + " is not a number");
                    }
                    break;
                case DataType.NUM_ARRAY:
                    result = toArray(cell);
                    if (result == null) {
                        console.error(`parse Object err [${rowID},${cellIndex}], key: [${name}], data: `, cell);
                    }
                    break;
                case DataType.STRING:
                    result = cell ? cell.toString() : "";
                    break;
                case DataType.STR_ARRAY:
                    result = toStringArray(cell);
                    break;
                case DataType.BOOL:
                    result = toBoolean(cell);
                    break;
                case DataType.BOOL_ARRAY:
                    result = toBoolArray(cell);
                    break;
                case DataType.OBJECT:
                    result = toObject(cell);
                    if (result == null) {
                        console.error(`parse Object err [${rowID},${cellIndex}],key: [${name}], data: `, cell);
                    }
                    break;
                case DataType.ARRAY:
                    result = toArray(cell);
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
                    case DataType.AUTO:
                        break;
                    case DataType.NUMBER:
                        type = "number;";
                        break;
                    case DataType.NUM_ARRAY:
                        type = "number[];";
                        break;
                    case DataType.STRING:
                        type = "string;";
                        break;
                    case DataType.STR_ARRAY:
                        type = "string[];";
                        break;
                    case DataType.BOOL:
                        type = "boolean;";
                        break;
                    case DataType.BOOL_ARRAY:
                        type = "boolean[];";
                        break;
                    case DataType.OBJECT:
                        type = "any;";
                        break;
                    case DataType.ARRAY:
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
    const parse = Parse.getInstance();

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
        writeJsonFile(fullPath, data) {
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
                this.writeFile(fullPath, data);
            });
        }
        writeFile(fullPath, data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!data) {
                    console.log(`FileUtils-> ${fullPath} 文件内容不能为空`);
                    return;
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

    class CustomConvert2Json {
        customConvertSheet(sheet) {
            let settings = sheet.settings;
            sheet.extname = ".json";
            parse.deleteExcludeData(sheet);
            let result = {
                keys: settings.key,
                data: [],
                index: {},
                redirect: {},
            };
            for (let i = settings.head, length = sheet.data.length; i < length; i++) {
                let row = sheet.data[i];
                let primaryKey = parse.formatPrimaryKey(row, settings);
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
                const cell = parse.convertCell(row[j], rowIndex, j, key, type);
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
                let fullpath = path__default["default"].join(outDir, `${name}${sheet.extname}`);
                fileUtils.writeFile(fullpath, sheet.text);
            });
        }
        saveDeclarationDoc(data, outDir) {
            let filename = `tbl.d.ts`;
            outDir = path__default["default"].resolve(outDir);
            if (outDir.includes(".")) {
                filename = path__default["default"].basename(outDir);
                outDir = path__default["default"].dirname(outDir);
            }
            // 生成 dts
            let dts = `declare global {\n`;
            dts += `\tnamespace tbl{\n`;
            Object.keys(data).forEach((name) => {
                const sheet = data[name];
                dts += parse.toDTS(sheet);
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
            fileUtils.writeFile(path__default["default"].join(outDir, filename), dts);
        }
    }

    class CustomConvertLanguage2Json {
        customConvertSheet(sheet) {
            let settings = sheet.settings;
            sheet.extname = ".json";
            parse.deleteExcludeData(sheet);
            // 多语言文档
            let languages = {};
            for (let i = settings.head, length = sheet.data.length; i < length; i++) {
                let row = sheet.data[i];
                let primaryKey = parse.formatPrimaryKey(row, settings);
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
                const cell = parse.convertCell(row[j], rowIndex, j, key, type);
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
                let fullpath = path__default["default"].join(outDir, `${name}${sheet.extname}`);
                fileUtils.writeFile(fullpath, sheet.text);
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
            outDir = path__default["default"].resolve(outDir);
            if (outDir.includes(".")) {
                filename = path__default["default"].basename(outDir);
                outDir = path__default["default"].dirname(outDir);
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
            fileUtils.writeFile(path__default["default"].join(outDir, filename), dts);
        }
    }

    class CustomConvert2Xml {
        customConvertSheet(sheet) {
            sheet.extname = ".xml";
            let custom2json = new CustomConvert2Json();
            let data = custom2json.customConvertSheet(sheet);
            if (typeof data === 'string') {
                let json = JSON.parse(data);
                const builder = new fastXmlParser.XMLBuilder({ format: true });
                const xmlContent = builder.build(json);
                return xmlContent;
            }
            else if (typeof data === 'object') {
                let json = {};
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        const builder = new fastXmlParser.XMLBuilder({ format: true });
                        const xmlContent = builder.build(element);
                        json[key] = xmlContent;
                    }
                }
                return json;
            }
            return null;
        }
        customConvertRow(row, rowIndex, settings) {
            let rowResult = {};
            let primaryKey = parse.formatPrimaryKey(row, settings);
            let length = Math.max(settings.key.length, settings.type.length, settings.platform.length, row.length);
            for (let j = 0; j < length; j++) {
                const key = settings.key[j];
                const type = settings.type[j];
                const cell = parse.convertCell(row[j], rowIndex, j, key, type);
                if (rowResult[key]) {
                    console.error(`已有相同键:[${rowIndex + 1},${j}], key: [${key}], data: [${rowResult[key]}]`);
                }
                rowResult[key] = cell;
            }
            return { primaryKey, data: rowResult };
        }
        saveFile(data, outDir) {
            Object.keys(data).forEach((name) => {
                const sheet = data[name];
                let fullpath = path__default["default"].join(outDir, `${name}${sheet.extname}`);
                fileUtils.writeFile(fullpath, sheet.text);
            });
        }
    }

    const config = {
        "json": CustomConvert2Json,
        "xml": CustomConvert2Xml,
        "language-json": CustomConvertLanguage2Json,
    };

    class Main {
        constructor() {
            this.help = `
--help           | -h    帮助信息
--input          | -i    输入目录或者 xlsx 文件  必选 [dir or xlsx] 
--output         | -o    输出目录               可选 缺省时为 --input [dir] 
--dts-output     | -dts  输出的 dts 文件目录     可选 缺省时为 --output [dir]
--format         | -f    导出的文件格式          json | xml | 后续扩展放入 config.ts
--json           |       json 对象参数          插件工具使用 将所有参数用对象的形式编码成 base64 字符串
`;
            this.customConvert = null;
        }
        exec(args) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                args = mergeAlias(args);
                if (args.help) {
                    console.log(`help:\n`, this.help);
                    return false;
                }
                if (!checkArgs(args)) {
                    return false;
                }
                if (!args.format) {
                    args.format = "json";
                }
                if (config[args.format]) {
                    this.customConvert = new config[args.format]();
                }
                let data = {};
                // 判断输入是文件夹还是文件
                let stat = fs__default["default"].lstatSync(args.input);
                let isDirectory = stat.isDirectory();
                if (isDirectory) {
                    if (!args.output) {
                        args.output = path__default["default"].join(args.input, "data");
                    }
                    data = yield this.parseDir(args.input);
                }
                else {
                    if (!args.output) {
                        let input_dir = path__default["default"].dirname(args.input);
                        args.output = path__default["default"].join(input_dir, "data");
                    }
                    data = yield this.parseFile(args.input);
                }
                // 保存文件
                this.customConvert.saveFile(data, args.output);
                if (args["dts-output"]) {
                    if (typeof args["dts-output"] === "boolean") {
                        args["dts-output"] = args.output;
                    }
                    (_b = (_a = this.customConvert).saveDeclarationDoc) === null || _b === void 0 ? void 0 : _b.call(_a, data, args["dts-output"]);
                    // 输出 dts 文件
                    // this.outputDts(data, args["dts-output"]);
                }
            });
        }
        parseDir(dir) {
            return __awaiter(this, void 0, void 0, function* () {
                // // 清空目录
                // fs.emptyDirSync(outDir);
                let files = fileUtils.filterFile(dir, (fileName) => {
                    let baseName = path__default["default"].basename(fileName);
                    let extName = path__default["default"].extname(fileName);
                    // 跳过被忽略的文件  跳过临时文件
                    if (baseName.startsWith("!") || baseName.startsWith("~")) {
                        return false;
                    }
                    if (extName == ".xlsx") {
                        return true;
                    }
                    return false;
                });
                let customDatas = {};
                for (let i = 0; i < files.length; i++) {
                    const element = files[i];
                    let customData = yield this.parseFile(element);
                    // 保存 json 文件
                    Object.keys(customData).forEach((name) => {
                        const sheet = customData[name];
                        if (customDatas[name]) {
                            console.log(`已有同名文件 ${name}`);
                            return;
                        }
                        customDatas[name] = sheet;
                    });
                }
                return customDatas;
            });
        }
        parseFile(filePath) {
            let file = xlsx__namespace.readFile(filePath);
            let workBook = parse.parseWorkBook(file, path__default["default"].basename(filePath, path__default["default"].extname(filePath)));
            let customForWorkBook = JSON.parse(JSON.stringify(workBook));
            let customData = parse.convertWorkBook(customForWorkBook, this.customConvert);
            return customData;
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
        args.input = args.input || args.i;
        args.output = args.output || args.o;
        args.format = args.format || args.f;
        args["dts-output"] = args["dts-output"] || args.dts;
        return args;
    }
    /** 检查参数 */
    function checkArgs(args) {
        if (!args.input) {
            console.error(`请设置 --input`);
            return false;
        }
        // 没有输出目录的时候用 输入目录
        // if (!args.output) {
        //     console.error(`请设置 --output`);
        //     return false;
        // }
        if (!fs__default["default"].existsSync(args.input)) {
            console.error(`输入路径不存在: ${args.input}`);
            return false;
        }
        return true;
    }

    // ##################
    // 输入
    const oargs = process.argv.slice(2);
    const args = minimist__default["default"](oargs);
    let main = new Main();
    if (oargs.length) {
        main.exec(args);
    }

}));
