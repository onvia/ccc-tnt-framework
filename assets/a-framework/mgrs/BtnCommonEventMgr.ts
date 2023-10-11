
import { _decorator, Component, Node, Button } from 'cc';
import { DEV } from 'cc/env';
import "../decorators/_decorator";
const { ccclass } = _decorator;
const { pluginMgr, plugin } = tnt._decorator;



declare module "cc" {

    export interface Node {
        __$$50BtnBindEvent: any;
    }
}

declare global {
    interface IPluginType {
        BtnCommonEventMgr: IBtnEventPlugin;
    }

    interface IBtnEventPlugin {
        name: string;
        priority: number;
        onClick(button: Button);
    }
    interface ITNT {
        btnCommonEventMgr: BtnCommonEventMgr;
    }
}


@pluginMgr('BtnCommonEventMgr')
@ccclass('BtnCommonEventMgr')
export class BtnCommonEventMgr implements IPluginMgr{

    public static ___plugins: IBtnEventPlugin[] = [];

    public bind(target: Node | Component) {
        let node: Node = target as any;
        if (target instanceof Component) {
            node = target.node;
        }

        this._bindButton(node);
    }
    private _bindButton(node: Node) {
        node.children.forEach((child) => {
            this._bindButtonEvent(child);
            this._bindButton(child);
        });
    }
    private _bindButtonEvent(node: Node) {
        // 已经注册过事件
        if (node.__$$50BtnBindEvent) {
            return;
        }
        let button = node.getComponent(Button);

        if (!button) {
            return false;
        }
        let event = (event) => {
            //被禁用的 node 节点不响应事件
            let eventNode = event.target as Node;
            let _button = eventNode.getComponent(Button);
            if (_button.interactable === false || eventNode.active === false) {
                return;
            }

            let hasClickEvent = node.hasEventListener(Button.EventType.CLICK);
            hasClickEvent = hasClickEvent || _button.clickEvents.length;
            // if(_button instanceof Toggle){
            //     hasClickEvent = hasClickEvent || node.hasEventListener(Toggle.EventType.TOGGLE) || _button.checkEvents.length;
            // }

            //检查 button 组件是否有事件处理函数，有则执行插件事件处理
            if (hasClickEvent) {
                this._execPluginOnClick(_button);
            } else {
                DEV && console.warn(`BtnCommonEventMgr-> ${eventNode.name} 没有注册点击事件，不处理插件函数`);
            }
        }

        node.__$$50BtnBindEvent = event;
        node.on(Node.EventType.TOUCH_END, event);
        return true;
    }

    private _execPluginOnClick(button: Button) {
        BtnCommonEventMgr.___plugins.forEach((plugin) => {
            plugin.onClick(button);
        });
    }

    
    registerPlugin?(plugins: IPluginCommon | IPluginCommon[]);
    unregisterPlugin?(plugin: IPluginCommon | string);
    
    private static _instance: BtnCommonEventMgr = null
    public static getInstance(): BtnCommonEventMgr {
        if (!this._instance) {
            this._instance = new BtnCommonEventMgr();
        }
        return this._instance;
    }
}
tnt.btnCommonEventMgr = BtnCommonEventMgr.getInstance();

/**
 * 按钮音效插件
 *
 * @class BtnCommonSoundEventPlugin
 * @implements {IBtnEventPlugin}
 */
@plugin("BtnCommonEventMgr")
@ccclass("BtnCommonSoundEventPlugin")
class BtnCommonSoundEventPlugin implements IBtnEventPlugin {
    name: string = "BtnCommonSoundEventPlugin";
    priority: number = 0;
    onClick(button: Button) {
        let sound = button.__$soundName;
        if (!sound && tnt.options.soundConfig) {
            if (button.node.name in tnt.options.soundConfig) {
                sound = tnt.options.soundConfig[button.node.name];
            }
        }
        tnt.audioMgr.playEffect(sound || tnt.options.defaultBtnSound);
    }
}