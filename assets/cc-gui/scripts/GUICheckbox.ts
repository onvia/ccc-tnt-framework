import { _decorator, Node, Toggle } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass } = _decorator;
const { prefabUrl, node, toggle, button } = tnt._decorator;


declare global {
    interface GUICheckboxOptions extends GUIBaseOptions {
        defaultChecked: boolean;
    }
}

@prefabUrl("cc-gui#prefabs/GUICheckbox")
@ccclass('GUICheckbox')
export class GUICheckbox extends GUIBase<GUICheckboxOptions> {



    @toggle("Toggle")
    toggle: Toggle = null;

    protected onStart(): void {
        super.onStart();
        this.toggle.isChecked = !!this.options.defaultChecked;
        this.registerToggleClick(this.toggle, this.onClickBtn);
    }

    onClickBtn() {
        this.options.clickFn(this.toggle.isChecked);
    }


    //protected update(dt: number): void {
    //    
    //}
}
