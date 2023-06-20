import { CustomConvert2Json } from "./custom-convert/custom-convert-json";
import { CustomConvertLanguage2Json } from "./custom-convert/custom-convert-language-json";
import { CustomConvert2Xml } from './custom-convert/custom-convert-xml';

export const config = {
    "json": CustomConvert2Json,
    "xml": CustomConvert2Xml,
    "language-json": CustomConvertLanguage2Json,
}

export const dtsConfig = {
    "json": null,
    "xml": null,
    "language-json": null,
}