//@ts-ignore
import packageJSON from '../package.json';

interface ExecuteSceneScriptMethodOptions {
    // Name of extension
    name: string;
    method: string;
    args: any[];
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    async refreshI18N() {
        const options: ExecuteSceneScriptMethodOptions = {
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
export const load = function() { };

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function() { };
