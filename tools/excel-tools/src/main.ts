import * as xlsx from 'xlsx';
import { ICustomConvertSheet, parse, SheetData } from './parse';
import { fileUtils } from './utils/file-utils';
import fs from 'fs-extra';
import path from 'path';
import { config, dtsConfig } from "./config";

export class Main {
    readonly help = `
--help           | -h    帮助信息
--input          | -i    输入目录或者 xlsx 文件  必选 [dir or xlsx] 
--output         | -o    输出目录               可选 缺省时为 --input [dir] 
--dts-output     | -dts  输出的 dts 文件目录     可选 缺省时为 --output [dir]
--format         | -f    导出的文件格式          json | xml | 后续扩展放入 config.ts
--json           |       json 对象参数          插件工具使用 将所有参数用对象的形式编码成 base64 字符串
`

    customConvert: ICustomConvertSheet = null;

    async exec(args) {
        args = mergeAlias(args);
        if (args.help) {
            console.log(`help:\n`, this.help);
            return false;
        }

        if (!checkArgs(args)) {
            return false;
        }
        if (!args.format) {
            args.format = "json"
        }

        if (config[args.format]) {
            this.customConvert = new config[args.format]();
        }

        let data: Record<string, SheetData> = {};
        // 判断输入是文件夹还是文件
        let stat = fs.lstatSync(args.input);
        let isDirectory = stat.isDirectory();
        if (isDirectory) {
            if (!args.output) {
                args.output = path.join(args.input, "data")
            }
            data = await this.parseDir(args.input);

        } else {
            if (!args.output) {
                let input_dir = path.dirname(args.input);
                args.output = path.join(input_dir, "data")
            }
            data = await this.parseFile(args.input);
        }

        // 保存文件
        this.customConvert.saveFile(data,args.output);

        
        if (args["dts-output"]) {
            if (typeof args["dts-output"] === "boolean") {
                args["dts-output"] = args.output;
            }
            this.customConvert.saveDeclarationDoc?.(data,args["dts-output"]);
            // 输出 dts 文件
            // this.outputDts(data, args["dts-output"]);
        }
    }


    async parseDir(dir: string) {
        // // 清空目录
        // fs.emptyDirSync(outDir);

        let files = fileUtils.filterFile(dir, (fileName) => {
            let baseName = path.basename(fileName);
            let extName = path.extname(fileName);
            // 跳过被忽略的文件  跳过临时文件
            if (baseName.startsWith("!") || baseName.startsWith("~")) {
                return false;
            }
            if (extName == ".xlsx") {
                return true;
            }
            return false;
        });

        let customDatas: Record<string, SheetData> = {};
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            let customData = await this.parseFile(element);
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
    }

    parseFile(filePath: string): Record<string, SheetData> {
        let file = xlsx.readFile(filePath);
        let workBook = parse.parseWorkBook(file, path.basename(filePath, path.extname(filePath)));
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
    if (!fs.existsSync(args.input)) {
        console.error(`输入路径不存在: ${args.input}`);
        return false;
    }
    return true;
}
