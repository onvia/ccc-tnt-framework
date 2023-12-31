import { _decorator, Node, Label, Sprite, Color, Button, Toggle, ToggleContainer } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass, property } = _decorator;
const { prefabUrl, node, sprite, button, label } = tnt._decorator;


declare global {
    interface GUIItemOptions {
        name: string;
        clickFn?: Runnable1<any>,
        updateFn?: Runnable,

    }
}

@prefabUrl("cc-gui#prefabs/GUIItem")
@ccclass('GUIItem')
export class GUIItem extends GUIBase<GUIItemOptions> {


    @sprite()
    protected background: Sprite = null;

    @sprite()
    protected checkMark: Sprite = null;


    @property(Color)
    private _normalColor: Color = new Color("#474d4f");
    public get normalColor(): Color {
        return this._normalColor;
    }
    public set normalColor(value: Color) {
        this._normalColor = value;
    }

    @property(Color)
    checkedColor: Color = new Color("#4d66cc");

    @property(Color)
    hoverColor: Color = new Color("#537885");

    @property(Color)
    pressedColor: Color = new Color("#4D5D9B");

    @property(Color)
    disabledColor: Color = new Color("#2a2a2aa0");


    public onCreate(): void {

    }

    protected onStart(): void {
        super.onStart();
        this.node.name = this.options.name;
    }


    asButton() {
        let button = this.node.getComponent(Button);
        if (!button) {
            button = this.node.addComponent(Button);
        }
        button.target = this.background.node;
        button.transition = Button.Transition.COLOR;
        this.updateButtonStyle(button);

        this.registerButtonClick(button, (target) => {
            this.options.clickFn?.(target);
        });

        tnt.btnCommonEventMgr.bind(this); // 注册按钮通用事件
        return this.parentGroup;
    }

    asToggle() {
        let toggle = this.node.getComponent(Toggle)
        if (!toggle) {
            toggle = this.node.addComponent(Toggle);
        }

        toggle.target = this.background.node;
        toggle.transition = Button.Transition.COLOR;
        toggle.checkMark = this.checkMark;
        this.updateButtonStyle(toggle);
        this.registerToggleClick(toggle, (target) => {
            this.options.clickFn?.(target.isChecked);
        });

        tnt.btnCommonEventMgr.bind(this); // 注册按钮通用事件
        return this.parentGroup;
    }

    private updateButtonStyle(button: Button) {
        button.disabledColor = this.disabledColor;
        button.normalColor = this.normalColor;
        button.hoverColor = this.hoverColor;
        button.pressedColor = this.pressedColor;
        this.checkMark.color = this.checkedColor;

    }


    protected update(dt: number): void {
        if (this.options.updateFn) {
            this.nameLabel.string = this.options.name + ": " + this.options.updateFn();
        }
    }
}
