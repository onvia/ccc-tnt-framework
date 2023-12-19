import { _decorator, Node, Color, Label, math, ProgressBar, ScrollView, Sprite, EditBox, js } from "cc";
import { VMItem } from "./VMItem";

const { ccclass } = _decorator;
const { node, sprite, button, label, mvvm, VMLabel, VMComponent, click, clazz } = tnt._decorator;


declare global {
    interface DemoVMDevOptions {

    }
}
@mvvm() // 不正常
@ccclass('DemoVMDevBase')
// @mvvm() // 正常
export class DemoVMDevBase extends tnt.SceneBase<DemoVMDevOptions> {


    @VMLabel({
        'string': {
            watchPath: ["*.array.0.age", "*.gold", "*.maxGold"], tween: 3,
            formatter: (opts) => {
                // 定制数据格式化，模板只能接收 2 个参数，这里将 3 个参数格式化成 2 个参数
                return [Math.floor(opts.newValue[0]), Math.floor(opts.newValue[1]) / Math.floor(opts.newValue[2])];
            },
        }
    })
    vmLabel1: Label = null;

    @VMComponent(Label, {
        "string": {
            isBidirectional: true,
            watchPath: ["*.gold", "*.maxGold"],
            tween: 4,
        },
        'color': "*.color",
    })
    vmLabel2: Label = null;

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
        console.log(`DemoVMDevBase-> `);
        let comp = this.node.getComponent(DemoVMDevBase);
        let su = js.getSuper(DemoVMDevBase);
        
        let is = comp == this;
        console.log(`DemoVMDevBase-> `);


    }
    onEnterTransitionStart(sceneName?: string): void {

        // this.testEvent();
        this.testLabel();
        // this.testSprite();
        // this.testProgressBar();
        // this.testFor();
        // this.testNodeActive();


        // 修改数据
        this.schedule(() => {
            this.data.icon = this.data2.icon.random();
            this.data.diamond = math.randomRangeInt(10, 9999);
            this.data.color = new Color(math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), 255);
        }, 1);

        this.schedule(() => {
            this.data.gold = 199;
            this.data.array[0].age = 99;
        }, 15, 999, 0.5);
    }

    testEvent() {

        tnt.vm.event(this, "*.diamond", (otps) => {
            console.log(`DemoVMNormal-> `, otps.newValue);

        });
        tnt.vm.event(this, ["*.diamond", "*.maxGold"], (otps) => {
            console.log(`DemoVMNormal-> `, otps.newValue);

        });
    }
    testLabel() {
        let label1: Label = this.getLabelByName("vmLabel1");
        let label2: Label = this.getLabelByName("vmLabel2");
        let label3: Label = this.getLabelByName("vmLabel3");
        let edit: EditBox = this.getEditBoxByName("vmLabel3");


        // 简单的绑定数据
        // tnt.vm.label(this, label3, "*.diamond"); // 绑定数据 Label 默认为 string ，这里绑定的是 data.diamond

        // 双向绑定
        tnt.vm.label(this, label3, {
            string: {
                isBidirectional: true,
                watchPath: "*.diamond"
            }
        });

        // 同时绑定多个属性
        tnt.vm.label(this, label2, {
            "string": {
                isBidirectional: true,
                watchPath: ["*.gold", "*.maxGold"],
                tween: tnt.vm.VMTween(4),
            },
            'color': "*.color",
        });

        // 定制数据，并通过缓动显示
        tnt.vm.label(this, label1, {

            "string": {
                watchPath: ["*.array.0.age", "*.gold", "*.maxGold"],
                tween: 3,
                formatter: (opts) => {
                    // 定制数据格式化，模板只能接收 2 个参数，这里将 3 个参数格式化成 2 个参数
                    return [Math.floor(opts.newValue[0]), Math.floor(opts.newValue[1]) / Math.floor(opts.newValue[2])];
                },
            }
        });
    }

    testSprite() {
        let sprite: Sprite = this.getSpriteByName("vmSprite");
        tnt.vm.sprite(this, sprite, "*.icon");

        // tnt.vm.toggle(this, sprite.node, "*.visible", () => { return !!1 });
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
        console.log("click");
    }

    protected onDestroy(): void {
    }
}
