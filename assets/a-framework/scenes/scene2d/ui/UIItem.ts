
import './UIBase';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



declare global {

    interface ITNT {
        UIItem: typeof UIItem;
    }

    namespace tnt {
        type UIItem<Options = any> = InstanceType<typeof UIItem<Options>>;
    }
}

@ccclass('UIItem')
class UIItem<Options = any> extends tnt.UIBase<Options> {

}

tnt.UIItem = UIItem;

export { }
