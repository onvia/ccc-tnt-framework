import { _decorator, Component, Node, Label, Rect, Color, Sprite, SpriteFrame, ProgressBar, tween, math, ScrollView } from 'cc';
import { VMItem } from './VMItem';
const { ccclass, property } = _decorator;

@ccclass('MVVMScene')
export class MVVMScene extends tnt.SceneBase implements IMVVMObject {
    static map = new WeakMap();
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

    data2 = {
        array: [
            { name: 'sn1', age: 18, sex: 0 },
            { name: 'sn2', age: 16, sex: 1 },
            { name: 'sn3', age: 12, sex: 2 },
        ],
        icon: ["resources#textures/star2", "resources#textures/goldcoin"],
    }

    onEnterTransitionStart(sceneName?: string): void {
        tnt.vm.observe(this);

        // this.testLabel();
        // this.testSprite();
        // this.testProgressBar();
        this.testFor();
        // this.testNodeActive();


        // this.schedule(() => {
        //     this.data.icon = this.data2.icon.random();
        //     this.data.diamond = math.randomRangeInt(10, 9999);
        //     this.data.color = new Color(math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), math.randomRangeInt(0, 255), 255);
        // }, 1);

        // this.schedule(() => {
        //     this.data.gold = 199;
        //     this.data.array[0].age = 99;
        // }, 15, 999, 0.5);
    }

    testLabel() {
        let label1: Label = this.getLabelByName("vmLabel1");
        let label2: Label = this.getLabelByName("vmLabel2");
        let label3: Label = this.getLabelByName("vmLabel3");


        tnt.vm.label(this, label3, "*.diamond");

        tnt.vm.label(this, label2, {
            "string": {
                watchPath: ["*.gold", "*.maxGold"],
                tween: tnt.vm.VMTween(4),
            },
            'color': "*.color",
        });

        tnt.vm.label(this, label1, {
            "string": {
                watchPath: ["*.array.0.age", "*.gold", "*.maxGold"],
                tween: 3,
                formator: (opts) => {
                    // 定制数据格式化，模板只能接收 2 个参数，这里将 3 个参数格式化成 2 个参数
                    return [Math.floor(opts.newValue[0]), Math.floor(opts.newValue[1]) / Math.floor(opts.newValue[2])];
                },
            }
        });
    }
    testSprite() {
        let sprite: Sprite = this.getSpriteByName("vmSprite");
        tnt.vm.sprite(this, sprite, "*.icon");
    }


    testProgressBar() {
        let progressBar: ProgressBar = this.getProgressBarByName("vmProgressBar");
        // 会自动对两个参数进行除法处理  这里是  gold/maxGold = 0-1
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

        this.registeButtonClick("btnAddItem", () => {
            this.data.array.push(this.data2.array.random());
        });

        this.registeButtonClick("btnDelItem", () => {
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

    protected onDestroy(): void {
        tnt.vm.violate(this);
        tnt.vm.violate("data2");
    }
}

