import { _decorator, Component, Node, Label, Rect, Color, Sprite, SpriteFrame, ProgressBar, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MVVMScene')
export class MVVMScene extends tnt.SceneBase implements IMVVMObject {
    static map = new WeakMap();
    data = {
        name: '小明',
        info: 'xin',
        gold: 0,
        diamond: 9000,
        progress: 0,
        icon: "resources#textures/content",
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
        coin: 1,
    }

    onEnterTransitionStart(sceneName?: string): void {
        // let proxy = tnt.vm._reactive(this.data);
        tnt.vm.observe(this);
        this.data2 = tnt.vm.observe(this.data2, 'data2');
        // this.data.name
        // this.data.name = "123";
        // this.data.obj.progress
        this.data.obj.progress = 1;
        // this.data.index[0];
        // this.data.index.push(8);
        // this.data.index.splice(0,1);

        // this.data.array[0].age;
        // this.data.array[1].age = 22;

        // proxy.obj.progress
        // proxy.obj.progress = 1;

        let label: Label = this.getLabelByName("label");
        let content: Node = this.getNodeByName("content");
        let progressBar: ProgressBar = this.getProgressBarByName("progressBar");
        // tnt.vm.bind(this, label, "*.name");
        // tnt.vm.bind(this, progressBar, {
        //     'progress': {
        //         watchPath: "*.progress",
        //         tween: tnt.vm.VMTween(3),
        //         formator: (opts) => {
        //             return Math.floor(opts.newValue * 100) / 100;
        //         }
        //     }
        // });
        // tnt.vm.bind(this, label, {
        //     color: "*.color"
        // });
        // tnt.vm.bind(this, label, {
        //     'string': {
        //         watchPath: "",
        //         // tween: 
        //         formator(options) {
        //             return "";
        //         },
        //     },
        //     'color': "*.color"
        // });

        // tnt.vm.bind(this, label, "*.array.0.age", () => {
        //     return Promise.resolve("");
        // });
        // tnt.vm.label(this, label.node, "*.array.0.age", () => {
        //     return Promise.resolve("");
        // });


        // tnt.vm.for(this,content,{
        //     watchPath: '*.index',
        //     component: null,
        //     onChange(operate) {

        //     },
        // })

        // tnt.vm.bind(this, label, {
        //     string: {
        //         watchPath: ["*.gold", "*.diamond",'data2.coin'],
        //         formator: (opt) => {
        //             return '';
        //         }
        //     }
        // });

        // tnt.vm.observe(this);
        // tnt.vm.observe(this, "MVVMScene");
        // tnt.vm.observe(this.data, "MvvmData");
        // tnt.vm.observe(this, { xxx: 11, ddd: 22 });
        // tnt.vm.observe(this, { xxx: 11, ddd: 22 },"MVVMTag");

        // setTimeout(() => {
        //     this.data.name = "小红"
        // }, 1000);
        // setTimeout(() => {
        //     label.node.destroy();
        //     label = null;
        // }, 2000);

        // setTimeout(() => {
        //     this.data.progress = 0.5;
        // }, 500);

        // setTimeout(() => {
        //     this.data.progress = 1;
        // }, 1000);

        this.testSprite();
    }


    testSprite() {

        let sprite: Sprite = this.getSpriteByName("sprite");
        tnt.vm.sprite(this, sprite, {
            'spriteFrame': {
                watchPath: "*.icon",
                formator: async (options) => {
                    let spriteFrame = await new Promise<SpriteFrame>((rs) => {
                        tnt.loaderMgr.share.load(options.newValue, SpriteFrame, (err, spriteFrame) => {
                            rs(err ? null : spriteFrame);
                        });
                    });
                    return spriteFrame;
                },
            }
        });
        tnt.vm.sprite(this, sprite, "*.icon", async (options) => {
            let spriteFrame = await new Promise<SpriteFrame>((rs) => {
                tnt.loaderMgr.share.load(options.newValue, SpriteFrame, (err, spriteFrame) => {
                    rs(err ? null : spriteFrame);
                });
            });
            return spriteFrame;
        });


        setTimeout(() => {
            this.data.icon = "resources#textures/goldcoin";
        }, 1000);
    }


    protected onDestroy(): void {
        tnt.vm.violate(this);
        tnt.vm.violate("data2");
    }
}

