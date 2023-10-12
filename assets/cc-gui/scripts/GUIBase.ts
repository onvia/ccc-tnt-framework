import { _decorator, Node, Label } from "cc";
import { GUITable } from "./GUITable";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, label } = tnt._decorator;


declare global {
    interface GUIBaseOptions {
        name: string;
        clickFn?: Runnable1<any>;
    }
}

@ccclass('GUIBase')
export class GUIBase<Options extends GUIBaseOptions> extends tnt.UIItem<Options> {


    @label("name")
    protected nameLabel: Label = null;

    parentGroup: GUITable<any> = null;

    protected onStart(): void {
        super.onStart();
        this.nameLabel && (this.nameLabel.string = this.options.name);
    }

    setGUIEnable(enable) {
        this.showNodeByName("disable", !enable);
        return this.parentGroup;
    }

    updateValue(arg1: any, arg2?: any, arg3?: any, arg4?: any) {

        throw new Error('[updateValue] Method not implemented.');
    }
}
