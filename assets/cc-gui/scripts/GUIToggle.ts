import { _decorator, Node, Toggle } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass } = _decorator;
const { prefabUrl, node, toggle, button } = tnt._decorator;


declare global {
    interface GUIToggleOptions extends GUIBaseOptions {
        defaultChecked: boolean;
    }
}

@prefabUrl("cc-gui#prefabs/GUIToggle")
@ccclass('GUIToggle')
export class GUIToggle extends GUIBase<GUIToggleOptions> {


    protected __preload(): void {
        super.__preload();
    }
    protected onStart(): void {
        super.onStart();
        this.node.toggle.isChecked = !!this.options.defaultChecked;
        this.registerToggleClick(this.node, this.onClickBtn);
    }

    onClickBtn() {
        this.options.clickFn(this.node.toggle.isChecked);
    }


    //protected update(dt: number): void {
    //    
    //}
}
