import { _decorator, Component, Node, Label, Sprite, Button } from 'cc';
const { ccclass, inspector, property } = _decorator;
const { node, label, button } = tnt._decorator;

@ccclass('DemoVMSprite')
export default class DemoVMSprite extends tnt.SceneBase implements IMVVMObject {

    @node()
    icon: Sprite = null;

    @label()
    labelPath: Label = null;

    @node()
    starGroup: Node = null;

    @label()
    labelCount: Label = null;


    data = {
        icon: "textures/star2",
        iconIdx: -1,
        count: 5,
    }
    icons = ["textures/gold", "textures/goldcoin", "textures/star2",];


    onEnable() {
        tnt.vm.observe(this);

        tnt.vm.label(this, this.labelPath, "*.icon");
        tnt.vm.sprite(this, this.icon, "*.icon");
        tnt.vm.label(this, this.labelCount, "*.count");

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

            this.data.count++;
        });

    }
    onDisable() {
        tnt.vm.violate(this);
    }

}

