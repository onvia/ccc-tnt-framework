import { _decorator, Node, Color, math, Label, Sprite } from "cc";
import { VMItem } from "./VMItem";
import { VMPanelBase } from "./VMPanelBase";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, VMLabel, VMSprite, VMFor, mvvm } = tnt._decorator;


declare global {
    interface VMPanel1Options {

    }
}

@prefabUrl("mvvm-example#prefabs/VMPanel")
@ccclass('VMPanel1')
@mvvm()
export class VMPanel1 extends VMPanelBase {


    @VMSprite({ color: { watchPath: "*.color" } })
    vmChild0: Sprite = null;

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


    // 替换掉之前
    @VMFor({
        watchPath: "*.array",
        component: VMItem,
        onChange(operate) {
            if (operate == 'delete' || operate === 'add') {
                this.scrollView.scrollToBottom(0.1);
                console.log(`${this.name}-> 数组变化`);
            }
        },
    })
    vmForContent: Node = null;



    public onCreate(): void {
        this.data.name = "Panel1";
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
