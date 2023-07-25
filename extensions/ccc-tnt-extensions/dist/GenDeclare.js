"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genDeclare = void 0;
const FileUtils_1 = require("./FileUtils");
class GenDeclare {
    arrayRemove(array, filter) {
        for (var i = array.length - 1; i > -1; --i) {
            filter(array[i], i, array) && array.splice(i, 1);
        }
    }
    /** 生成 UI 声明文件 */
    async genUIDeclare() {
        let uiWindowScripts = await FileUtils_1.fileUtils.queryClass("UIWindowBase");
        let uiBaseScripts = await FileUtils_1.fileUtils.queryClass("UIBase");
        let sceneScripts = await FileUtils_1.fileUtils.queryClass("SceneBase");
        // 
        this.arrayRemove(uiBaseScripts, (value) => {
            return value.className === "UIBase"
                || value.className === "UIItem"
                || value.className === "UIPanel"
                || value.className === "UIPopup"
                || value.className === "UIWindow"
                || value.className === "UIWindowBase"
                || value.className === "SceneBase"
                || value.className === "RedPointComp";
        });
        let windowMappingTable = {};
        uiWindowScripts.forEach((_script) => {
            windowMappingTable[_script.className] = true;
        });
        // 
        let sceneMappingTable = {};
        sceneScripts.forEach((_script) => {
            sceneMappingTable[_script.className] = true;
        });
        let interfaces = "";
        let globalWindowType = `\tinterface GlobalWindowType{\n`;
        let globalUIType = `\tinterface GlobalUIType{\n`;
        let imports = "";
        uiBaseScripts.forEach((_script) => {
            if (sceneMappingTable[_script.className]) {
                return;
            }
            interfaces += `\tinterface ${_script.className}Options{}\n`;
            imports += `import { ${_script.className} } from ".${_script.classPath.replace(Editor.Project.path, '').replace(".ts", '').replace(/\\/g, '/')}"\n`;
            if (windowMappingTable[_script.className]) {
                // 弹窗
                globalWindowType += `\t\t"${_script.className}": {\n`;
                globalWindowType += `\t\t\tctor: ${_script.className},\n`;
                globalWindowType += `\t\t\toptions: ${_script.className}Options,\n`;
                globalWindowType += `\t\t}\n`;
            }
            else {
                // item
                globalUIType += `\t\t"${_script.className}": {\n`;
                globalUIType += `\t\t\tctor: ${_script.className},\n`;
                globalUIType += `\t\t\toptions: ${_script.className}Options,\n`;
                globalUIType += `\t\t}\n`;
            }
        });
        globalWindowType += "\t}";
        globalUIType += "\t}";
        let content = imports + "\n";
        content += "declare global {\n";
        content += interfaces + "\n";
        content += globalWindowType + "\n";
        content += globalUIType;
        content += "\n}";
        await FileUtils_1.fileUtils.writeFile(`${Editor.Project.path}/ui.d.ts`, content);
        return uiWindowScripts;
    }
    async genSceneDeclare() {
        await this._genDeclare("SceneBase", "GlobalSceneType", "scene");
    }
    /** 生成 */
    async _genDeclare(baseClass, globalType, fileName) {
        let scripts = await FileUtils_1.fileUtils.queryClass(baseClass);
        this.arrayRemove(scripts, (value) => {
            return value.className === "SceneBase";
        });
        let interfaces = "";
        let globalUIType = `\tinterface ${globalType}{\n`;
        let imports = "";
        scripts.forEach((_script) => {
            interfaces += `\tinterface ${_script.className}Options{}\n`;
            imports += `import { ${_script.className} } from ".${_script.classPath.replace(Editor.Project.path, '').replace(".ts", '').replace(/\\/g, '/')}"\n`;
            globalUIType += `\t\t"${_script.className}": {\n`;
            globalUIType += `\t\t\tctor: ${_script.className},\n`;
            globalUIType += `\t\t\toptions: ${_script.className}Options,\n`;
            globalUIType += `\t\t}\n`;
        });
        let content = imports + "\n";
        content += "declare global {\n";
        content += interfaces + "\n";
        content += globalUIType;
        content += "\t}\n}";
        await FileUtils_1.fileUtils.writeFile(`${Editor.Project.path}/${fileName}.d.ts`, content);
        return scripts;
    }
}
exports.genDeclare = new GenDeclare();
