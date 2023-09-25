import { _decorator, Node, Layout, __private, Button, ToggleContainer, Size } from "cc";
import { GUIBase } from "./GUIBase";
import { GUICheckbox } from "./GUICheckbox";
import { GUIEditText } from "./GUIEditText";
import { GUIGroup } from "./GUIGroup";
import { GUIItem } from "./GUIItem";
import { GUIProgressBar } from "./GUIProgressBar";
import { GUISlider } from "./GUISlider";
import { GUIToggle } from "./GUIToggle";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button } = tnt._decorator;


declare global {
    interface GUITableOptions extends GUIBaseOptions {
    }
}

@prefabUrl("cc-gui#prefabs/GUITable")
@ccclass('GUITable')
export class GUITable<Options extends GUITableOptions> extends GUIBase<Options> {


    protected layout: Layout = null;

    @node()
    public content: Node = null;


    public onCreate(): void {
        this.loaderKey = tnt.gui.loader.key;
        if (!this.content) {
            this.content = this.node;
        }
    }

    protected onStart(): void {
        super.onStart();
        this.node.name = this.options.name;
        this.layout = this.getComponent(Layout);

    }

    private _doToggleEnsureValidState = tnt.functionUtils.debounce(function () {
        let toggleContainer = this.content.getComponent(ToggleContainer);
        if (!toggleContainer) {
            toggleContainer = this.content.addComponent(ToggleContainer);
        }
        toggleContainer.ensureValidState();
    });

    /** 布局方向 */
    setOrientation(type: __private._cocos_ui_layout__Type) {
        this.layout.type = type;
        return this;
    }

    addTable(name: string) {
        let ui: GUITable<GUITableOptions> = this.addUISync<GUITableOptions, GUITable<GUITableOptions>>(GUITable, this.content, { name });
        ui.parentGroup = this as any;
        return ui;
    }

    addGroup(name: string) {
        let ui: GUIGroup<GUIGroupOptions> = this.addUISync<GUIGroupOptions, GUIGroup<GUIGroupOptions>>(GUIGroup, this.content, { name });
        ui.parentGroup = this;
        return ui;
    }

    addItem(name: string) {
        let ui = this.addUISync(GUIItem, this.content, { name });
        ui.parentGroup = this;
        return this;
    }

    addItemToggle(name: string, clickFn?: Runnable1<void | string | number | boolean>) {
        let ui = this.addUISync(GUIItem, this.content, { name, clickFn: clickFn });
        ui.parentGroup = this;
        ui.asToggle();
        this._doToggleEnsureValidState();
        return this;
    }

    addItemButton(name: string, clickFn?: Runnable1<void | string | number>) {
        let ui = this.addUISync(GUIItem, this.content, { name, clickFn: clickFn });
        ui.parentGroup = this;
        ui.asButton();
        return this;
    }

    /** 复选框 */
    addCheckbox(name: string, clickFn: Runnable1<boolean>, defaultChecked: boolean = true) {
        let ui = this.addUISync(GUICheckbox, this.content, { name, clickFn: clickFn, defaultChecked });
        ui.parentGroup = this;
        return this;
    }

    /** 单选框 */
    addToggle(name: string, clickFn: Runnable1<boolean>, defaultChecked: boolean = true) {
        let ui = this.addUISync(GUIToggle, this.content, { name, clickFn: clickFn, defaultChecked });
        ui.parentGroup = this;
        this._doToggleEnsureValidState();
        return this;
    }

    addProgressBar(name: string, options: { updateProgressFn: () => number, updateLabelFn: () => string }) {
        let ui = this.addUISync(GUIProgressBar, this.content, { name, ...options });
        ui.parentGroup = this;
        return this;
    }

    // addIconButton() {

    // }

    addEditText(name: string, clickFn: Runnable1<string>) {
        let ui = this.addUISync(GUIEditText, this.content, { name, clickFn: clickFn });
        ui.parentGroup = this;
        return this;
    }

    addSlider(name: string, options: { defaultValue?: number, maxValue?: number, callback?: Runnable1<number> }) {
        let ui = this.addUISync(GUISlider, this.content, { name, ...options });
        ui.parentGroup = this;
        return this;
    }

    addDropDownList() {

    }


}
