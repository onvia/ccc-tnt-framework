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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const xlsx = __importStar(require("xlsx"));
const parse_1 = require("./parse");
const file_utils_1 = require("./utils/file-utils");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
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
            if (config_1.config[args.format]) {
                this.customConvert = new config_1.config[args.format]();
            }
            let data = {};
            // 判断输入是文件夹还是文件
            let stat = fs_extra_1.default.lstatSync(args.input);
            let isDirectory = stat.isDirectory();
            if (isDirectory) {
                if (!args.output) {
                    args.output = path_1.default.join(args.input, "data");
                }
                data = yield this.parseDir(args.input);
            }
            else {
                if (!args.output) {
                    let input_dir = path_1.default.dirname(args.input);
                    args.output = path_1.default.join(input_dir, "data");
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
            let files = file_utils_1.fileUtils.filterFile(dir, (fileName) => {
                let baseName = path_1.default.basename(fileName);
                let extName = path_1.default.extname(fileName);
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
        let file = xlsx.readFile(filePath);
        let workBook = parse_1.parse.parseWorkBook(file, path_1.default.basename(filePath, path_1.default.extname(filePath)));
        let customForWorkBook = JSON.parse(JSON.stringify(workBook));
        let customData = parse_1.parse.convertWorkBook(customForWorkBook, this.customConvert);
        return customData;
    }
}
exports.Main = Main;
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
    if (!fs_extra_1.default.existsSync(args.input)) {
        console.error(`输入路径不存在: ${args.input}`);
        return false;
    }
    return true;
}
