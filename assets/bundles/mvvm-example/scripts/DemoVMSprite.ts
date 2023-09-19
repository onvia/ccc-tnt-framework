import { _decorator, Component, Node, Label, Sprite, Button, sp } from 'cc';
const { ccclass, inspector, property } = _decorator;
const { node, label, button, component } = tnt._decorator;

@ccclass('DemoVMSprite')
export class DemoVMSprite extends tnt.SceneBase implements IMVVMObject {

    @node()
    icon: Sprite = null;

    @label()
    labelPath: Label = null;

    @node()
    starGroup: Node = null;

    @label()
    labelCount: Label = null;

    @component("spineboy-pro", sp.Skeleton)
    spineBoy: sp.Skeleton = null;

    data = {
        icon: "textures/star2",
        iconIdx: -1,
        count: 5,
        spinePath: "common-bundle#spine/raptor/raptor-pro",
    }
    icons = ["textures/gold", "textures/goldcoin", "textures/star2", null];

    spines = ["common-bundle#spine/spineboy/spineboy-pro", "common-bundle#spine/raptor/raptor-pro", null];

    onEnable() {
        tnt.vm.observe(this);

        tnt.vm.label(this, this.labelPath, "*.icon");
        tnt.vm.sprite(this, this.icon, "*.icon");
        tnt.vm.label(this, this.labelCount, "*.count");
        tnt.vm.bind(this, this.spineBoy, {
            skeletonData: {
                watchPath: "*.spinePath",
                onValueChange: (opt) => {
                    if (!opt.newValue) {
                        return;
                    }
                    if (opt.newValue == this.spines[0]) {
                        this.spineBoy.setAnimation(0, "idle", true);
                    } else if (opt.newValue == this.spines[1]) {
                        this.spineBoy.setAnimation(0, "walk", true);
                    }
                }
            }
        })


        for (let i = 0; i < this.starGroup.children.length; i++) {
            const child = this.starGroup.children[i];

            // spriteFrame 和 grayscale
            tnt.vm.sprite(this, child, {
                spriteFrame: "*.icon",
                grayscale: {
                    watchPath: "*.iconIdx",
                    formatter: (opts) => {
                        // 当索引为 0 的时候 节点设置为灰态
                        return opts.newValue == 0;
                    }
                }
            });

            // active
            tnt.vm.node(this, child, {
                active: {
                    watchPath: "*.count",
                    formatter: (opts) => {
                        let x = opts.newValue % this.starGroup.children.length;
                        return x >= i;
                    }
                }
            });
        }

        this.registerButtonClick("btnChanage", () => {
            this.data.iconIdx++;
            this.data.icon = this.icons[this.data.iconIdx % this.icons.length];

            this.data.spinePath = this.spines[this.data.iconIdx % this.spines.length];

            this.data.count++;
        });

    }
    onDisable() {
        tnt.vm.violate(this);
    }

}

