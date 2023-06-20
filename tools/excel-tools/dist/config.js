"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_convert_json_1 = require("./custom-convert/custom-convert-json");
const custom_convert_xml_1 = require("./custom-convert/custom-convert-xml");
exports.default = {
    "json": custom_convert_json_1.CustomConvert2Json,
    "xml": custom_convert_xml_1.CustomConvert2Xml,
};
