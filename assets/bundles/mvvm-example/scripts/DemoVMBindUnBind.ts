
import { _decorator, Component, Node, Label, v3, Color } from 'cc';
const { ccclass, property } = _decorator;
const { node, label, button, slider, progressBar, editBox } = tnt._decorator;
import { userData } from './UserData';

@ccclass('DemoVMBindUnBind')
export class DemoVMBindUnBind extends tnt.SceneBase implements IMVVMObject {



    @label()
    levelLabel: Label = null;

    @node()
    starGroup: Node = null;

    @node()
    logo: Node = null;

    declare data: any;

    userData: typeof userData;
    onEnable() {
        // 注册按钮事件
        this.registerButtonClick('btnRemoveStartAll', this.onClickRemoveStartAll);
        this.registerButtonClick('btnAddStartScale', this.onClickAddStartScale);
        this.registerButtonClick('btnAddStartAngle', this.onClickAddStartAngle);
        this.registerButtonClick('btnRemoveStartScale', this.onClickRemoveStartScale);
        this.registerButtonClick('btnRemoveStartAngle', this.onClickRemoveStartAngle);
        this.registerButtonClick("btnAddLevel", () => {
            this.userData.level = Math.max(0, this.userData.level + 1);
        });
        this.registerButtonClick("btnMulLevel", () => {
            this.userData.level = Math.max(0, this.userData.level - 1);
        });

        // 对数据进行劫持
        this.userData = tnt.vm.observe(userData, "userData");

        // 等级标签
        tnt.vm.label(this, this.levelLabel, "userData.level");

        // 增加角度监听
        this.onClickAddStartAngle();
        // 增加缩放监听
        this.onClickAddStartScale();

        // logo 透明度
        tnt.vm.bind(this, this.logo.uiOpacity, "userData.level", (opts) => {
            return opts.newValue > 3 ? 255 : 126;
        });

        // logo 颜色
        tnt.vm.bind(this, this.logo.sprite, {
            
            color: {
                watchPath: "userData.level",
                formatter: (opts) => {
                    return opts.newValue > 3 ? Color.RED : Color.BLUE;
                }
            }
        });


    }

    onDisable() {
        tnt.vm.violate("userData")
    }



    onClickRemoveStartAll() {
        let result = false;
        // 移除绑定
        for (let i = 0; i < this.starGroup.children.length; i++) {
            const child = this.starGroup.children[i];
            let _res = tnt.vm.unbind(child);
            if (_res) {
                result = true;
            }
        }

        this.showToast('移除', '星星', '所有绑定', result);
    }


    onClickAddStartAngle() {
        // 控制星星的角度
        for (let i = 0; i < this.starGroup.children.length; i++) {
            const child = this.starGroup.children[i];
            tnt.vm.node(this, child, {
                angle: {
                    watchPath: "userData.level",
                    formatter: (opts) => {
                        return opts.newValue > i ? 30 : 0;
                    }
                }
            })
        }

        this.showToast('增加', '星星', 'angle 绑定', true);
    }
    onClickRemoveStartAngle() {
        let result = false;
        for (let i = 0; i < this.starGroup.children.length; i++) {
            const child = this.starGroup.children[i];
            let _res = tnt.vm.unbind(child, (handler) => {
                return handler.attr._targetPropertyKey == 'angle';
            });
            if (_res) {
                result = true;
            }
        }

        this.showToast('移除', '星星', 'angle 绑定', result);
    }


    onClickAddStartScale() {

        // 控制星星的角度
        for (let i = 0; i < this.starGroup.children.length; i++) {
            const child = this.starGroup.children[i];
            tnt.vm.node(this, child, {
                scale: {
                    watchPath: "userData.level",
                    formatter: (opts) => {
                        return opts.newValue > i ? v3(1, 1, 1) : v3(0.5, 0.5, 0.5);
                    }
                }
            })
        }

        this.showToast('增加', '星星', 'scale 绑定', true);
    }
    onClickRemoveStartScale() {
        let result = false;
        // // 移除星星的缩放 控制 
        for (let i = 0; i < this.starGroup.children.length; i++) {
            const child = this.starGroup.children[i];
            let _res = tnt.vm.unbind(child, (handler) => {
                return handler.attr._targetPropertyKey == 'scale';
            });
            if (_res) {
                result = true;
            }
        }

        this.showToast('移除', '星星', 'scale 绑定', true);

    }
    showToast(method: '移除' | "增加", name, property, result) {
        tnt.toast.show(`${method}${name}${property}${result ? "成功" : "失败"}`);
    }

}
