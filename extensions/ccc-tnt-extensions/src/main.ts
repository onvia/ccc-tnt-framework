//@ts-ignore
import packageJSON from '../package.json';
import { genDeclare } from './GenDeclare';
import { genTemplate } from './GenTemplate';

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },
    panelOpen() {

    },
    sceneOpen(uuid: string) {
        console.log(`tnt: SceneOpen [${uuid}]`);
    },

    /** 生成 UI 声明文件 */
    async genUIDeclare() {
        genDeclare.genUIDeclare();
    },

    /** 生成 场景 声明文件 */
    async genSceneDeclare() {
        genDeclare.genSceneDeclare();
    },
    /** 创建模板 */
    async createTemplete() {
        genTemplate.createTemplete();
    },
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () {

};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () {

};
