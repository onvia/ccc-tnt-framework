
import './UIBase';
import { _decorator } from "cc";
const { ccclass } = _decorator;



declare global {

    interface ITNT {
        UIPanel: typeof UIPanel;
    }

    namespace tnt {
        type UIPanel<Options = any> = InstanceType<typeof UIPanel<Options>>;
    }
}
@ccclass('UIPanel')
class UIPanel<Options = any> extends tnt.UIBase<Options> implements ILoaderKeyAble {


    /**
     * 窗口激活
     */
    onActive() {
        console.log(`UIPanel-> ${this.uuid} 激活`);

    }

    /**
     * 窗口冻结
     */
    onFreeze() {
        console.log(`UIPanel-> ${this.uuid} 冻结`);
    }

}

tnt.UIPanel = UIPanel;

export { };