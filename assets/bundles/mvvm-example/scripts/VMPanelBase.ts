import { _decorator, Node, Label, math, Color } from "cc";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, VMLabel, mvvm } = tnt._decorator;


declare global {
    interface VMPanelBaseOptions {

    }
}

//@prefabUrl("{bundle}#{path}/VMPanelBase")
@mvvm()
@ccclass('VMPanelBase')
export class VMPanelBase extends tnt.UIPanel<VMPanelBaseOptions> {


    // @VMLabel("*.name")
    // title: Label = null;


    data = {
        name: "PanelBase",
        obj: { progress: 1 },
        color: new Color(255, 1, 234, 255)
    }

    protected onStart(): void {
        this.schedule(() => {
            this.data.obj.progress = math.randomRangeInt(0, 100);
        }, 3.5);
    }
}
