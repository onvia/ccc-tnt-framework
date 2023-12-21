import { _decorator, Node, Color, math, Label, Sprite, Vec3 } from "cc";
import { VMPanel1 } from "./VMPanel1";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, VMLabel, VMNode, VMEvent, VMSprite, mvvm } = tnt._decorator;


declare global {
    interface VMPanel1Options {

    }
}

@mvvm()
@prefabUrl("mvvm-example#prefabs/VMPanel")
@ccclass('VMPanel3')
export class VMPanel3 extends VMPanel1 {


    @VMSprite({
        color: {
            watchPath: "*.color", formatter(opts) {
                return new Color(math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), 255);
            }
        }
    })
    vmChild1: Sprite = null;

    @VMEvent("*.color", function () {
        let self: VMPanel3 = this;
        self.vmChild2.color = new Color(math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), 255);
    })
    @VMNode({
        scale: {
            watchPath: "*.color", formatter(opts) {
                let scale = math.randomRange(0.1, 2);
                return new Vec3(scale, scale, scale);
            }
        }
    })
    @sprite()
    vmChild2: Sprite = null;

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
        super.onCreate();
        this.data.name = "Panel3"
    }


    //protected update(dt: number): void {
    //    
    //}
}
