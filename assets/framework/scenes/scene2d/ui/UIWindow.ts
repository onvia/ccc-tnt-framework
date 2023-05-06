
import './UIWindowBase';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



interface ITopMenuBarOptions {
}

declare global {

    interface ITNT {
        UIWindow: typeof UIWindow;
    }

    namespace tnt {
        type UIWindow<Options = any> = InstanceType<typeof UIWindow<Options>>;
    }
}

@ccclass('UIWindow')
class UIWindow<Options = any> extends tnt.UIWindowBase<Options> {

    public topMenuBarOptions: ITopMenuBarOptions = null;

    setTopMenuBar(options: ITopMenuBarOptions) {
        this.topMenuBarOptions = options;
    }
}

tnt.UIWindow = UIWindow;

export { };