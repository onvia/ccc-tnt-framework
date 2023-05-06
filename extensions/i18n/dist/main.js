"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    async refreshI18N() {
        const options = {
            name: 'i18n',
            method: 'updateSceneRenderers',
            args: []
        };
        // result: {}
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () { };
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () { };
exports.unload = unload;
