import * as xlsx from 'xlsx';
import { CustomConvert2Json } from './custom-convert/custom-convert-json';
import { ICustomConvertSheet, parse, SheetData } from './parse';
import { fileUtils } from './utils/FileUtils';
import fs from 'fs-extra';
import path from 'path';
import config from "./config";

export class Main {
    readonly help = `
--help           | -h    帮助信息
--input          | -i   输入目录或者 xlsx 文件  必选 [dir or xlsx] 
--output         | -o  输出目录               可选 缺省时为 --input [dir] 
--dts-output     | -dts  输出的 dts 文件目录     可选 缺省时为 --output [dir]
--format         | -f     导出的文件格式          json | xml | 后续扩展放入 config.ts
--json           |        json 对象参数          插件工具使用 将所有参数用对象的形式编码成 base64 字符串
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
            data = await this.parseDir(args.input, args.output);

        } else {
            if (!args.output) {
                let input_dir = path.dirname(args.input);
                args.output = path.join(input_dir, "data")
            }

            data = await this.parseFile(args.input);
        }

        // 输出 json 文件
        this.outputFile(data, args.output);

        if (args["dts-output"]) {
            if (typeof args["dts-output"] === "boolean") {
                args["dts-output"] = args.output;
            }
            // 输出 dts 文件
            this.outputDts(data, args["dts-output"]);
        }
    }


    async parseDir(dir: string, outDir: string) {
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
                    console.error(`Main-> `);
                    return;
                }
                customDatas[name] = sheet;
            });
        }

        return customDatas;
    }

    parseFile(filePath: string): Record<string, SheetData> {
        let file = xlsx.readFile(filePath);
        let workBook = parse.parseWorkBook(file,path.basename(filePath,path.extname(filePath)));
        // 做测试，使用拷贝数据
        let customForWorkBook = JSON.parse(JSON.stringify(workBook));
        // 自定义转换
        let customData = parse.convertWorkBook(customForWorkBook, this.customConvert);
        return customData;
    }

    outputFile(data: Record<string, SheetData>, outDir: string) {
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            let fullpath = path.join(outDir, `${name}${sheet.extname}`);
            fileUtils.writeFile(fullpath, sheet.text);
        });
    }

    outputDts(data: Record<string, SheetData>, outDir: string) {
        let filename = `tbl.d.ts`;
        outDir = path.resolve(outDir);
        if (outDir.includes(".")) {
            filename = path.basename(outDir);
            outDir = path.dirname(outDir);
        }
        // 生成 dts
        let dts = `declare global {\n`;
        dts += `\tnamespace tbl{\n`;
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            if(sheet.customConfig === 'i18n'){
                return;
            }
            dts += parse.toDTS(sheet);
        });
        dts += '\t}\n';
        dts += '}\n';
        dts += `export { };\n\n`;


        dts += `declare global {\n`;
        dts += `\tinterface ITbl {\n`;

        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            if(sheet.customConfig === 'i18n'){
                return;
            }
            dts += `\t\t${sheet.name}: GTbl<tbl.${sheet.name}>;\n`
        });

        dts += `\t}\n`;
        dts += `}`;


        fileUtils.writeFile(path.join(outDir, filename), dts);
    }


    test() {
        let filePath = "./test-data/test.xlsx";
        let file = xlsx.readFile(filePath);
        let workBook = parse.parseWorkBook(file,path.basename(filePath,path.extname(filePath)));

        // // 做测试，使用拷贝数据
        // let normalForWorkBook = JSON.parse(JSON.stringify(workBook));

        // // 正常转换
        // let normalData = parse.convertWorkBook(normalForWorkBook);
        // Object.keys(normalData).forEach((name) => {
        //     const sheet = normalData[name];
        //     fileUtils.writeJsonFile(`./test/normal_${name}.json`, sheet.text);
        // });


        let customConvert = new CustomConvert2Json();
        // 做测试，使用拷贝数据
        let customForWorkBook = JSON.parse(JSON.stringify(workBook));
        // 自定义转换
        let customData = parse.convertWorkBook(customForWorkBook, customConvert);


        // 保存 json 文件
        Object.keys(customData).forEach((name) => {
            const sheet = customData[name];
            fileUtils.writeJsonFile(`./test-out/custom_${name}.json`, sheet.text);
        });



        // 生成 dts
        let dts = `declare global {\n`;
        dts += `\tnamespace tbl{\n`;
        Object.keys(customData).forEach((name) => {
            const sheet = customData[name];
            dts += parse.toDTS(sheet);
        });
        dts += '\t}\n';
        dts += '}\n';
        dts += `export { };`;
        fileUtils.writeFile(`./test-out/custom_tbl.d.ts`, dts);

        // let outDir = path.join("d:/test/test.d.ts");
        // if (outDir.includes(".")) {
        //     let cacheDir = outDir;
        //     outDir = path.basename(outDir);
        //     let filename = cacheDir.replace(outDir, "");
        // }
        console.log(`Main-> `);

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
