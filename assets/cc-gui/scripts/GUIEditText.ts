import { _decorator, Node, Label, EditBox, Button } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, label, editBox } = tnt._decorator;


declare global {
    interface GUIEditTextOptions extends GUIBaseOptions {
    }
}

@prefabUrl("cc-gui#prefabs/GUIEditText")
@ccclass('GUIEditText')
export class GUIEditText extends GUIBase<GUIEditTextOptions> {


    @editBox("EditBox")
    protected editBox: EditBox = null;

    protected onStart(): void {
        super.onStart();
        this.registerButtonClick("Button", this.onClickBtn);
    }

    onClickBtn() {
        this.options.clickFn(this.editBox.string);
    }

    //protected update(dt: number): void {
    //    
    //}
}
