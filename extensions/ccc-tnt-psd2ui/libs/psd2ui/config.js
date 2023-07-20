"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.Config = void 0;
const EditorVersion_1 = require("./EditorVersion");
const CCButton_1 = require("./engine/cc/CCButton");
const CCProgressBar_1 = require("./engine/cc/CCProgressBar");
const CCToggle_1 = require("./engine/cc/CCToggle");
class Config {
    constructor() {
        this.help = `
--help           | --h    帮助信息
--init           | --i    初始化缓存文件         必须设置 --project-assets --cache 两项
--force-img      | --fimg    强制导出图片           即使在有缓存的情况下也要导出
--input          | --in   输入目录或者 psd 文件  非 init 时 必选 [dir or psd] 
--output         | --out  输出目录               可选 缺省时为 --input [dir] 
--engine-version | --ev   引擎版本               可选           [v249 | v342 | v362] 
--project-assets | --p    指定项目文件夹         可选            [dir] 
--cache-remake   | --crm  重新创建缓存文件       可选
--cache          | --c    缓存文件全路径         可选            [file-full-path] 
--config         |        预制体配置             可选            [file-full-path] 
--img-only       |        只导出图片             可选           
--json           |        json 对象参数          插件工具使用 将所有参数用对象的形式编码成 base64 字符串     
`;
        this.editorVersion = EditorVersion_1.EditorVersion.v249;
        this.DEFAULT_SPRITEFRAME_MATERIAL = {
            [EditorVersion_1.EditorVersion.v249]: "eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432",
            [EditorVersion_1.EditorVersion.v342]: "",
            [EditorVersion_1.EditorVersion.v362]: "",
        };
        this.DEFAULT_LABEL_MATERIAL = {
            [EditorVersion_1.EditorVersion.v249]: "eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432",
            [EditorVersion_1.EditorVersion.v342]: "",
            [EditorVersion_1.EditorVersion.v362]: "",
        };
        this.CompMippings = {
            "Btn": CCButton_1.CCButton,
            "ProgressBar": CCProgressBar_1.CCProgressBar,
            "Toggle": CCToggle_1.CCToggle,
        };
        // text 文本 Y 偏移
        this.textOffsetY = {
            default: 0,
            "36": 0,
        };
        // text 文本 行高偏移，默认为 0 ，行高默认为 字体大小
        this.textLineHeightOffset = 0;
    }
    get SpriteFrame_Material() {
        return this.DEFAULT_SPRITEFRAME_MATERIAL[exports.config.editorVersion];
    }
    get Label_Material() {
        return this.DEFAULT_LABEL_MATERIAL[exports.config.editorVersion];
    }
}
exports.Config = Config;
exports.config = new Config();
