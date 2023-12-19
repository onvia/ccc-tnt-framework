import { _decorator, Node, Color, Label, math, ProgressBar, ScrollView, Sprite, EditBox, js } from "cc";
import { DemoVMDevBase } from "./DemoVMDevBase";
import { VMItem } from "./VMItem";

const { ccclass } = _decorator;
const { node, sprite, button, label, mvvm, VMLabel, VMComponent,VMSprite, click, clazz } = tnt._decorator;


declare global {
    interface DemoVMDevOptions {

    }
}
// @mvvm() // 不正常
@ccclass('DemoVMDev')
@mvvm() // 正常
export class DemoVMDev extends DemoVMDevBase {

    @VMSprite("*.icon")
    vmSprite: Sprite = null;

    protected onEnable(): void {
        super.onEnable();
        this.testFor();

    }
    testEvent() {

        tnt.vm.event(this, "*.diamond", (otps) => {
            console.log(`DemoVMNormal-> `, otps.newValue);

        });
        tnt.vm.event(this, ["*.diamond", "*.maxGold"], (otps) => {
            console.log(`DemoVMNormal-> `, otps.newValue);

        });
    }
    testSprite() {
        let sprite: Sprite = this.getSpriteByName("vmSprite");
        tnt.vm.sprite(this, sprite, "*.icon");

        tnt.vm.toggle(this, sprite.node, "*.visible", () => { return !!1 });
    }


    testProgressBar() {
        let progressBar: ProgressBar = this.getProgressBarByName("vmProgressBar");

        // 会自动对两个参数进行除法处理  这里是  gold/maxGold = 值范围 0~1

        // 简单用法
        // tnt.vm.progressBar(this, progressBar.node,["*.gold", "*.maxGold"]);

        // 使用缓动
        tnt.vm.progressBar(this, progressBar.node, {
            'progress': {
                watchPath: ["*.gold", "*.maxGold"],
                tween: 4
            }
        });
    }
    testFor() {
        let scrollView = this.findComponent("ScrollView", ScrollView);
        let vmForContent = this.getNodeByName("vmForContent");

        this.registerButtonClick("btnAddItem", () => {
            this.data.array.push(this.data2.array.random());
        });

        this.registerButtonClick("btnDelItem", () => {
            if (this.data.array.length) {
                this.data.array.removeOne(this.data.array.random());
            }
        });

        tnt.vm.for(this, vmForContent, {
            watchPath: "*.array",
            component: VMItem,
            onChange: (operate) => {
                if (operate == 'delete' || operate === 'add') {
                    scrollView.scrollToBottom(0.1);
                }
            },
        });
    }

    testNodeActive() {
        let arr = ['selectA', 'selectB', 'selectC'];
        for (let i = 0; i < 3; i++) {
            let node = this.getNodeByName("vmChild" + i);
            tnt.vm.node(this, node, `*.check.${arr[i]}`);
        }
    }


    @click("TestButton")
    onClickTest() {
        console.log("click 1");
    }

    protected onDestroy(): void {
    }
}
