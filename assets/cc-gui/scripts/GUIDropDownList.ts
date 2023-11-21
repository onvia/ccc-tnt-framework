import { _decorator, Node, Layout, Label, Widget, instantiate, Button, find, Vec3 } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass } = _decorator;
const { prefabUrl, node, label, layout, widget } = tnt._decorator;


declare global {
    interface GUIDropDownListOptions {
        name: string;
        selectFn: Runnable1<string>;
        list: string[];
    }
}

@prefabUrl("cc-gui#prefabs/GUIDropDownList")
@ccclass('GUIDropDownList')
export class GUIDropDownList extends GUIBase<GUIDropDownListOptions> {

    @layout()
    protected layout: Layout = null;

    @node()
    public content: Node = null;

    @label("name")
    protected nameLabel: Label = null;

    @widget("comboBox")
    public comboBoxWidget: Widget = null;


    @node()
    private optionsNode: Node = null;

    @node("arrow")
    protected arrow: Node = null;

    @node("ScrollView")
    protected scrollView: Node = null;

    @label()
    protected selected: Label = null;

    /** 折叠 */
    protected isFold: boolean = false;

    protected onStart(): void {
        super.onStart();
        this.nameLabel.updateRenderData();
        this.comboBoxWidget.right = 0;
        this.layout.updateLayout();
        // this.comboBoxWidget.updateAlignment();
        this.scrollView.widget?.destroy()
        this.scrollView.removeFromParent();
        this.optionsNode.removeFromParent();
        this.scrollView.parent = tnt.componentUtils.getCanvas(this.node);
        this.isFold = false;
        this.registerButtonClick(this.comboBoxWidget.node, this.onClickArrow, this);

        this.setFold(this.isFold);

        for (let i = 0; i < this.options.list.length; i++) {
            const itemText = this.options.list[i];
            let optionsNode = instantiate(this.optionsNode);
            let optionsText = find("optionsText", optionsNode);
            optionsText.label.string = itemText;
            optionsNode.parent = this.content;
            this.registerButtonClick(optionsNode, this.onClickOptions.bind(this, itemText), this);
        }

        this.content.layout?.updateLayout();
        if (this.content.uiTransform.height <= this.scrollView.uiTransform.height) {
            this.scrollView.uiTransform.height = this.content.uiTransform.height + 5;
        }
        this.select(this.options.list[0]);


        this.scheduleOnce(() => {
            this.comboBoxWidget.right = 0;
            this.comboBoxWidget.left = this.nameLabel.node.uiTransform.width + this.layout.paddingLeft + this.layout.spacingX;
        });
    }

    /** 设置折叠 */
    protected setFold(isFold: boolean) {
        this.isFold = isFold;
        this.arrow.angle = this.isFold ? 270 : 0;
        this.scrollView.active = !this.isFold;
    }

    protected lateUpdate(dt: number): void {
        if (!this.isFold) {
            this.scrollView.uiTransform.width = this.comboBoxWidget.node.uiTransform.width;
            this.scrollView.uiTransform.priority = 888;
            let worldPoint = this.comboBoxWidget.node.uiTransform.convertToWorldSpaceAR(new Vec3(0, 0));
            let nodePoint = this.scrollView.parent.uiTransform.convertToNodeSpaceAR(worldPoint);
            nodePoint.y -= this.comboBoxWidget.node.uiTransform.height / 2;
            this.scrollView.position = nodePoint;
        }
    }
    private onClickArrow() {
        this.setFold(!this.isFold);
    }

    onClickOptions(itemText: string, button: Button) {
        this.select(itemText);
    }

    select(text: string) {
        this.options?.selectFn?.(text);
        this.setFold(true);
        this.selected.string = text;
    }

    protected onDestroy(): void {
        this.optionsNode.destroy();
        this.scrollView.destroy();
    }

}
