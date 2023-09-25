import { _decorator, Node, Label, Event, Sprite, Mask, ScrollView, Size } from "cc";
import { GUITable } from "./GUITable";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, label, scrollView } = tnt._decorator;


declare global {
    interface GUIGroupOptions extends GUITableOptions {
        isFold?: boolean;
    }
}
@prefabUrl("cc-gui#prefabs/GUIGroup")
@ccclass('GUIGroup')
export class GUIGroup<Options extends GUIGroupOptions> extends GUITable<Options> {


    @node("arrow")
    protected arrow: Node = null;



    /** 折叠 */
    protected isFold: boolean = false;

    protected onStart(): void {
        super.onStart();
        this.isFold = this.options.isFold ?? this.isFold;
        this.registerNodeTouchEvent(this.arrow, this.onClickArrow, this);
        this.setFold(this.isFold);
    }

    public setFold(isFold: boolean) {
        this.isFold = isFold;
        this.arrow.angle = this.isFold ? 90 : 0;
        this.content.active = !this.isFold;
    }

    private onClickArrow() {
        this.setFold(!this.isFold);
    }

}
