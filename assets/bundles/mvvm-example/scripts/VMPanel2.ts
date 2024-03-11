import { _decorator, Node, Color, math, Label } from "cc";
import { VMPanelBase } from "./VMPanelBase";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, VMSprite, VMLabel, mvvm } = tnt._decorator;


declare global {
    interface VMPanel1Options {

    }
}

@prefabUrl("mvvm-example#prefabs/VMPanel")
@ccclass('VMPanel2')
@mvvm()
export class VMPanel2 extends VMPanelBase {


    @VMSprite({ color: { watchPath: "*.color" } })
    vmChild0: Node = null;

    @VMLabel({
        string: {
            watchPath: "*.obj.progress",
            tween: 3,
            formatter: (opts) => {
                return (opts.newValue / 100).toFixed(2);
            }
        }
    })
    label: Label = null;


    public onCreate(): void {

    }

    protected onStart(): void {
        super.onStart();

        this.data.name = "Panel2";
        // 修改数据
        this.schedule(() => {
            this.data.color = new Color(math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), 255);
        }, 1);

    }


    //protected update(dt: number): void {
    //    
    //}
}
