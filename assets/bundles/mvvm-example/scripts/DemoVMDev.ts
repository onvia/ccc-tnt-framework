import { _decorator, Node, Color, Label, math, ProgressBar, ScrollView, Sprite, EditBox, js } from "cc";
import { VMItem } from "./VMItem";
import { VMPanel1 } from "./VMPanel1";
import { VMPanel2 } from "./VMPanel2";
import { VMPanel3 } from "./VMPanel3";

const { ccclass } = _decorator;
const { node, sprite, button, label, mvvm, VMLabel, VMComponent, click } = tnt._decorator;


declare global {
    interface DemoVMDevOptions {

    }
}

@ccclass('DemoVMDev')
export class DemoVMDev extends tnt.SceneBase<DemoVMDevOptions> {



    @node()
    Layout: Node = null;

    // 数据
    data = {
        name: '小明',
        info: 'xin',
        gold: 0,
        maxGold: 999,
        diamond: 0,
        progress: 0,
        icon: "resources#textures/star2",
        check: {
            selectA: true,
            selectB: false,
            selectC: false,
        },
        obj: {
            progress: 0
        },
        array: [
            { name: 's1', age: 18, sex: 0 },
            { name: 's2', age: 16, sex: 1 },
            { name: 's3', age: 12, sex: 2 },
        ],
        index: [2, 1, 6, 3, 7, 5, 4],
        color: new Color(255, 1, 234, 255),
    }

    // 当前例子中没有组件与 data2 数据进行绑定
    data2 = {
        array: [
            { name: 'sn1', age: 18, sex: 0 },
            { name: 'sn2', age: 16, sex: 1 },
            { name: 'sn3', age: 12, sex: 2 },
        ],
        icon: ["resources#textures/star2", "resources#textures/goldcoin"],
    }

    protected onEnable(): void {

    }

    onEnterTransitionStart(sceneName?: string): void {
        this.addUI(VMPanel1, this.Layout);
        this.addUI(VMPanel2, this.Layout);
        this.addUI(VMPanel3, this.Layout);
        this.addUI(VMPanel2, this.Layout);
    }


    protected onDestroy(): void {
    }
}
