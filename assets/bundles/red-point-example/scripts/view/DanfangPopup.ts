
import { _decorator, Component, Node } from 'cc';
import { RedPointCompProxy } from '../RedPointCompProxy';
const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;


@prefabUrl('red-point-example#prefabs/view/DanfangPopup')
@ccclass('DanfangPopup')
export class DanfangPopup extends tnt.UIPopup {


    redPointMap = {
        [10064]: "btnLevelup",
        [10065]: "btnCompound",
    }

    protected onStart(): void {
        for (const id in this.redPointMap) {
            const nodeName = this.redPointMap[id];

            let node = this.getNodeByName(nodeName);
            let redPointRoot = this.getNodeByName("RedPoint", node);
            tnt.redPointMgr.setDisplayProxy(parseInt(id),redPointRoot, RedPointCompProxy);
        }

        this.registerButtonClick("btnLevelup", () => {
            tnt.game.redPointData.simulationLevelupDanfang();
        });

        this.registerButtonClick("btnCompound", () => {

            tnt.game.redPointData.simulationCompoundupDanfang();
        });
    }

    protected onEnable(): void {
        // // 更新一次红点 可以不加，在 RedPointData 更新数据时 已经更新了所有红点
        // for (const id in this.redPointMap) {
        //     tnt.redPointMgr.updateRedPoint(parseInt(id));
        // }
    }

    onActive(): void {

    }

    onFreeze(): void {

    }
}
