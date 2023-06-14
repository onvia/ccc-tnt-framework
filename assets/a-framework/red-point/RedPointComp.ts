
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

declare global {

    interface ITNT {
        RedPointComp: typeof RedPointComp;
    }

    namespace tnt {
        type RedPointComp = InstanceType<typeof RedPointComp>;
    }
}
@ccclass('RedPointComp')
abstract class RedPointComp extends tnt.UIItem {

    public showType: tnt.RedPoint.ShowType = tnt.RedPoint.ShowType.Normal;

    public updateShowType(showType: tnt.RedPoint.ShowType) {
        if (this.showType != showType) {
            this.showType = showType;
        }
    }

    public abstract updateCount(count: number);

}

tnt.RedPointComp = RedPointComp;

export { };