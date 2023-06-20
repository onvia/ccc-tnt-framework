"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomConvert2Xml = void 0;
const parse_1 = require("../parse");
const fast_xml_parser_1 = require("fast-xml-parser");
const custom_convert_json_1 = require("./custom-convert-json");
class CustomConvert2Xml {
    customConvertSheet(sheet) {
        sheet.extname = ".xml";
        let custom2json = new custom_convert_json_1.CustomConvert2Json();
        let data = custom2json.customConvertSheet(sheet);
        if (typeof data === 'string') {
            let json = JSON.parse(data);
            const builder = new fast_xml_parser_1.XMLBuilder({ format: true });
            const xmlContent = builder.build(json);
            return xmlContent;
        }
        else if (typeof data === 'object') {
            let json = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    const builder = new fast_xml_parser_1.XMLBuilder({ format: true });
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
        let primaryKey = parse_1.parse.formatPrimaryKey(row, settings);
        let length = Math.max(settings.key.length, settings.type.length, settings.platform.length, row.length);
        for (let j = 0; j < length; j++) {
            const key = settings.key[j];
            const type = settings.type[j];
            const cell = parse_1.parse.convertCell(row[j], rowIndex, j, key, type);
            if (rowResult[key]) {
                console.error(`已有相同键:[${rowIndex + 1},${j}], key: [${key}], data: [${rowResult[key]}]`);
            }
            rowResult[key] = cell;
        }
        return { primaryKey, data: rowResult };
    }
}
exports.CustomConvert2Xml = CustomConvert2Xml;
