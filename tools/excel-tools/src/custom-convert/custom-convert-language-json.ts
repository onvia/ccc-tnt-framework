import path from "path";
import { ICustomConvertSheet, parse, Settings, SheetData } from "../parse";
import { fileUtils } from "../utils/file-utils";

export class CustomConvertLanguage2Json implements ICustomConvertSheet {

    customConvertSheet(sheet: SheetData): string | Record<string, any> {
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
    customConvertRow(row: string[], rowIndex: number, settings: Settings) {
        let flags = {};
        let rowResult = [];

        let length = Math.max(settings.key.length, settings.type.length, settings.platform.length, row.length)
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

    saveFile(data: Record<string, SheetData>, outDir: string) {
        Object.keys(data).forEach((name) => {
            const sheet = data[name];
            let fullpath = path.join(outDir, `${name}${sheet.extname}`);
            fileUtils.writeFile(fullpath, sheet.text);
        });
    }

    saveDeclarationDoc(data: Record<string, SheetData>, outDir: string) {
        let keys = Object.keys(data);
        if (!keys.length) {
            return;
        }

        let name = keys[0];
        const sheet = data[name];
        let json = JSON.parse(sheet.text);

        let filename = `language.d.ts`;
        outDir = path.resolve(outDir);
        if (outDir.includes(".")) {
            filename = path.basename(outDir);
            outDir = path.dirname(outDir);
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

        fileUtils.writeFile(path.join(outDir, filename), dts);
    }
}