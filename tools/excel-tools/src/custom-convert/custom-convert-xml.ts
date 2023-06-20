import { ICustomConvertSheet, parse, Settings, SheetData } from "../parse";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import { CustomConvert2Json } from "./custom-convert-json";


export class CustomConvert2Xml implements ICustomConvertSheet {

    customConvertSheet(sheet: SheetData): string | Record<string, any> {

        sheet.extname = ".xml";
        let custom2json = new CustomConvert2Json();

        let data = custom2json.customConvertSheet(sheet);
        if (typeof data === 'string') {
            let json = JSON.parse(data);
            const builder = new XMLBuilder({ format: true });
            const xmlContent = builder.build(json);
            return xmlContent;
        } else if (typeof data === 'object') {
            let json = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    const builder = new XMLBuilder({ format: true });
                    const xmlContent = builder.build(element);
                    json[key] = xmlContent;
                }
            }
            return json;
        }
        return null;
    }
    customConvertRow(row: string[], rowIndex: number, settings: Settings) {
        let rowResult = {};
        let primaryKey = parse.formatPrimaryKey(row, settings);

        let length = Math.max(settings.key.length, settings.type.length, settings.platform.length, row.length)
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
}