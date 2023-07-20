
import { _decorator, Component, Node, Label } from 'cc';
let { label, node, prefabUrl } = tnt._decorator;
const { ccclass, property } = _decorator;


@prefabUrl("red-point-example#prefabs/RedPoint")
@ccclass('RedPointCompProxy')
export class RedPointCompProxy extends tnt.RedPointComp {

    @label()
    labelCount: Label = null;

    @node()
    mark: Node = null;

    updateShowType(showType: tnt.RedPoint.ShowType): void {
        super.updateShowType(showType);

        this.labelCount.node.active = showType === tnt.RedPoint.ShowType.Number;
        this.mark.active = showType === tnt.RedPoint.ShowType.Mark;

    }
    updateCount(count: number) {
        this.labelCount.string = `${count}`;

    }

}
