"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const GenDeclare_1 = require("./GenDeclare");
const GenTemplate_1 = require("./GenTemplate");
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    openPanel() {
        Editor.Panel.open(package_json_1.default.name);
    },
    panelOpen() {
        console.log(`main-> panelOpen`);
    },
    sceneOpen(uuid) {
        console.log(`main-> sceneOpen  ${uuid}`);
    },
    /** 生成 UI 声明文件 */
    async genUIDeclare() {
        GenDeclare_1.genDeclare.genUIDeclare();
    },
    /** 生成 场景 声明文件 */
    async genSceneDeclare() {
        GenDeclare_1.genDeclare.genSceneDeclare();
    },
    /** 创建模板 */
    async createTemplete() {
        GenTemplate_1.genTemplate.createTemplete();
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () {
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
};
exports.unload = unload;
