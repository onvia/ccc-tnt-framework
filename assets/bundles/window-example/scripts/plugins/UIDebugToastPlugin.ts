import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
const { plugin } = tnt._decorator;

@plugin("UIMgr")
@ccclass('UIDebugToastPlugin')
export class UIDebugToastPlugin implements IUIWindowPlugin {
    name: string = "UIDebugToastPlugin";

    onUIMgrReInit?() {
        
    }
    onWindowCreated?(view: tnt.UIWindowBase<any>, name: string) {
        tnt.uiMgr.showDebugToast(`创建 ${name} `);
    }
    onWindowShowBefor?(view: tnt.UIWindowBase<any>, name: string) {
        
    }
    onWindowShowAfter?(view: tnt.UIWindowBase<any>, name: string) {
        tnt.uiMgr.showDebugToast(`显示 ${name}`);
    }
    onWindowClose?(view: tnt.UIWindowBase<any>, name: string) {
        
        tnt.uiMgr.showDebugToast(`关闭 ${name}`);
    }
    onBeClean?(view: tnt.UIWindowBase<any>, name: string) {
        
    }
    onWindowDestroy?(view: tnt.UIWindowBase<any>, name: string) {
        
        // tnt.uiMgr.showDebugToast(`销毁界面 ${name}`);
    }
    onPluginRegister?() {
        
    }
    onPluginUnRegister?() {
        
    }
 
}

