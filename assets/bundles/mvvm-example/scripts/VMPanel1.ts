import { _decorator, Node, Color, math, Label, Sprite } from "cc";
import { VMPanelBase } from "./VMPanelBase";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, VMLabel, VMSprite, mvvm } = tnt._decorator;


declare global {
    interface VMPanel1Options {

    }
}

@mvvm()
@prefabUrl("mvvm-example#prefabs/VMPanel")
@ccclass('VMPanel1')
export class VMPanel1 extends VMPanelBase {


    // @VMSprite({ color: { watchPath: "*.color" } })
    // vmChild0: Sprite = null;

    // @VMLabel({
    //     string: {
    //         watchPath: "*.obj.progress",
    //         tween: 3,
    //         formatter: (opts) => {
    //             return (opts.newValue / 100).toFixed(2);
    //         }
    //     }
    // })
    // label: Label = null;

    data = {
        name: "Panel1",
        obj: { progress: 1 },
        color: new Color(255, 1, 234, 255)
    }

    public onCreate(): void {

    }

    protected onStart(): void {
        super.onStart();

        // 修改数据
        this.schedule(() => {
            this.data.color = new Color(math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), 255);
        }, 1);

    }


    //protected update(dt: number): void {
    //    
    //}
}
