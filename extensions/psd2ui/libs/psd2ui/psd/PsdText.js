"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsdText = void 0;
const config_1 = require("../config");
const Color_1 = require("../values/Color");
const PsdLayer_1 = require("./PsdLayer");
class PsdText extends PsdLayer_1.PsdLayer {
    parseSource() {
        super.parseSource();
        let textSource = this.source.text;
        let style = textSource.style;
        if (style) {
            let fillColor = style.fillColor;
            if (fillColor) {
                this.color = new Color_1.Color(fillColor.r, fillColor.g, fillColor.b, fillColor.a * 255);
            }
        }
        this.text = textSource.text;
        this.fontSize = style.fontSize;
        this.offsetY = config_1.config.textOffsetY[this.fontSize] || config_1.config.textOffsetY["default"] || 0;
        this.parseSolidFill();
        this.parseStroke();
        return true;
    }
    onCtor() {
    }
    /** 描边 */
    parseStroke() {
        var _a, _b;
        if ((_a = this.source.effects) === null || _a === void 0 ? void 0 : _a.stroke) {
            let stroke = (_b = this.source.effects) === null || _b === void 0 ? void 0 : _b.stroke[0];
            // 外描边
            if ((stroke === null || stroke === void 0 ? void 0 : stroke.enabled) && (stroke === null || stroke === void 0 ? void 0 : stroke.position) === "outside") {
                let color = stroke.color;
                this.outline = {
                    width: stroke.size.value,
                    color: new Color_1.Color(color.r, color.g, color.b, stroke.opacity * 255)
                };
            }
        }
    }
    /** 解析 颜色叠加 */
    parseSolidFill() {
        var _a, _b;
        if ((_a = this.source.effects) === null || _a === void 0 ? void 0 : _a.solidFill) {
            let solidFills = (_b = this.source.effects) === null || _b === void 0 ? void 0 : _b.solidFill;
            for (let i = 0; i < solidFills.length; i++) {
                const solidFill = solidFills[i];
                if (solidFill.enabled) {
                    let color = solidFill.color;
                    this.color = new Color_1.Color(color.r, color.g, color.b, solidFill.opacity * 255);
                }
            }
        }
    }
}
exports.PsdText = PsdText;
