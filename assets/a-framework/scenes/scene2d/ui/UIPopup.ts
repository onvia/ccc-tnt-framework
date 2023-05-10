
import './UIWindowBase';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



declare global {

    interface ITNT {
        UIPopup: typeof UIPopup;
    }

    namespace tnt {
        type UIPopup<Options = any> = InstanceType<typeof UIPopup<Options>>;
    }
}
@ccclass('UIPopup')
class UIPopup<Options = any> extends tnt.UIWindowBase<Options> {

    constructor() {
        super();
        this._isClickAnyWhereClose = true;
    }

}


tnt.UIPopup = UIPopup;

export { };