import { _decorator, Node, Label, Event, Sprite, Mask, ScrollView, Size, widgetManager, view } from "cc";
import { GUIGroup } from "./GUIGroup";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button, label, scrollView } = tnt._decorator;


declare global {
    interface GUIWindowGroupOptions extends GUIGroupOptions {
        size?: Size;
    }
}

@prefabUrl("cc-gui#prefabs/GUIWindow")
@ccclass('GUIWindow')
export class GUIWindow extends GUIGroup<GUIWindowGroupOptions> {


    @scrollView("ScrollView")
    protected scrollView: ScrollView = null;

    @node()
    protected view: Node = null;

    @sprite()
    protected dragArea: Sprite = null;

    protected onStart(): void {
        super.onStart();

        if (!this.options.size) {
            this.options.size = new Size(200, 300);
        }
        let visibleSize = view.getVisibleSize();
        this.options.size.width = Math.max(Math.min(this.options.size.width, visibleSize.width - 2), 200)
        this.options.size.height = Math.max(Math.min(this.options.size.height, visibleSize.height - 10), 300)
        this.node.uiTransform.width = this.options.size.width;
        this.node.uiTransform.height = this.options.size.height;
        this.scrollView.node.uiTransform.height = this.options.size.height - this.dragArea.node.uiTransform.height;

        // 转换拖动
        let _dragArea = this.dragArea.node;
        _dragArea.draggable = true;
        _dragArea.on(Node.DragEvent.DRAG_START, this.onDragAreaDragStart, this);

        this.content.on(Node.EventType.SIZE_CHANGED, this.onContentChildChanged, this);
        this.registerNodeTouchEvent(this.node, {
            onTouchBegan: (event) => {
                this.node.setSiblingIndex(this.node.parent.children.length - 1);
            },
        });
    }


    public setFold(isFold: boolean) {
        super.setFold(isFold);
        this.scrollView.node.active = !isFold;
    }

    private onDragAreaDragStart(event: Event) {
        let curTarget = event.currentTarget as Node;
        curTarget.stopDrag();
        this.node.startDrag();
    }

    private onContentChildChanged() {
        let showScrollBar = this.content.uiTransform.height > this.view.uiTransform.height;
        this.scrollView.verticalScrollBar.node.active = showScrollBar;
        this.content.widget.right = showScrollBar ? (this.scrollView.verticalScrollBar.node.uiTransform.width) : 0;

        this.view.mask.enabled = showScrollBar;
        widgetManager.refreshWidgetOnResized(this.content);

        this.scheduleOnce(() => {
            this.scrollView.enabled = showScrollBar;
        });
    }

}
