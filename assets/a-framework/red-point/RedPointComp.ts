
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

    /**
     * 更新显示状态
     *
     * @param {*} display
     * @memberof RedPointComp
     */
    public updateDisplay(display) {
        this.node.active = display;
    }

    /**
     * 更新显示类型
     *
     * @param {tnt.RedPoint.ShowType} showType
     * @memberof RedPointComp
     */
    public updateShowType(showType: tnt.RedPoint.ShowType) {
        if (this.showType != showType) {
            this.showType = showType;
        }
    }

    /**
     * 更新红点计数
     *
     * @abstract
     * @param {number} count
     * @memberof RedPointComp
     */
    public abstract updateCount(count: number);

}

tnt.RedPointComp = RedPointComp;

export { };