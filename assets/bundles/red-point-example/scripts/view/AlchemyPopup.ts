
import { _decorator, Component, Node } from 'cc';
import { RedPointCompProxy } from '../RedPointCompProxy';
import { redPointData } from '../RedPointData';
const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;

@prefabUrl('red-point-example#prefabs/view/AlchemyPopup')
@ccclass('AlchemyPopup')
export class AlchemyPopup extends tnt.UIPopup {


    redPointMap = {
        [10061]: "btnLiandan",
        [10062]: "btnLevelupDanlu",
        [10063]: "btnDanfang",
    }

    protected onStart(): void {
        for (const id in this.redPointMap) {
            const nodeName = this.redPointMap[id];

            let node = this.getNodeByName(nodeName);
            let redPointRoot = this.getNodeByName("RedPoint", node);
            tnt.redPointMgr.setDisplayProxy(parseInt(id), redPointRoot, RedPointCompProxy);
        }

        this.registerButtonClick("btnLiandan", () => {
            redPointData.simulationAlchemy();
        });

        this.registerButtonClick("btnLevelupDanlu", () => {

            redPointData.simulationLevelDanlu();
        });
        this.registerButtonClick("btnDanfang", () => {
            tnt.uiMgr.showWindow("DanfangPopup");

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
