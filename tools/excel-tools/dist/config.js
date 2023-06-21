"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const custom_convert_json_1 = require("./custom-convert/custom-convert-json");
const custom_convert_language_json_1 = require("./custom-convert/custom-convert-language-json");
const custom_convert_xml_1 = require("./custom-convert/custom-convert-xml");
exports.config = {
    "json": custom_convert_json_1.CustomConvert2Json,
    "xml": custom_convert_xml_1.CustomConvert2Xml,
    "language-json": custom_convert_language_json_1.CustomConvertLanguage2Json,
};
