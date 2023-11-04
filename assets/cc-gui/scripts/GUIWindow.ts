import { _decorator, Node, Label, Event, Sprite, Mask, ScrollView, Size, widgetManager, view, Vec3, director, Director, sys } from "cc";
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

    private get maxHeight() {
        const safeArea = sys.getSafeAreaRect();
        return safeArea.height - 10;
    }

    private _isLeft = false;

    protected onStart(): void {
        super.onStart();

        if (!this.options.size) {
            this.options.size = new Size(200, 300);
        }
        const safeArea = sys.getSafeAreaRect();
        this.options.size.width = Math.max(Math.min(this.options.size.width, safeArea.width - 2), 200)
        this.options.size.height = Math.max(Math.min(this.options.size.height, this.maxHeight), 300)
        this.node.uiTransform.width = this.options.size.width;
        this.node.uiTransform.height = this.maxHeight; //this.options.size.height;
        // this.scrollView.node.uiTransform.height = this.options.size.height - this.dragArea.node.uiTransform.height;

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

        if (this._isLeft) {
            this.node.x = -safeArea.width * 0.5 + this.node.uiTransform.width * 0.5;
        } else {
            this.node.x = safeArea.width * 0.5 - this.node.uiTransform.width * 0.5;
        }
    }


    /** 设置折叠 */
    protected setFold(isFold: boolean) {
        super.setFold(isFold);
        this.scrollView.node.active = !isFold;
    }

    private onDragAreaDragStart(event: Event) {
        let curTarget = event.currentTarget as Node;
        curTarget.stopDrag();
        this.node.startDrag();
    }

    private onContentChildChanged() {
        let maxScrollViewHeight = this.maxHeight - this.dragArea.node.uiTransform.height;
        let showScrollBar = this.content.uiTransform.height > maxScrollViewHeight;
        this.scrollView.verticalScrollBar.node.active = showScrollBar;
        this.content.widget.right = showScrollBar ? (this.scrollView.verticalScrollBar.node.uiTransform.width) : 0;

        this.scrollView.node.uiTransform.height = Math.min(this.content.uiTransform.height, maxScrollViewHeight);

        if (!showScrollBar) {
            this.content.position = new Vec3(this.content.position.x, this.scrollView.node.uiTransform.height * 0.5, this.content.position.z)
        }


        this.view.mask.enabled = showScrollBar;


        widgetManager.refreshWidgetOnResized(this.content);
        widgetManager.refreshWidgetOnResized(this.view);
        widgetManager.refreshWidgetOnResized(this.scrollView.node);
        // widgetManager.refreshWidgetOnResized(this.node);



        // director.emit(Director.EVENT_AFTER_UPDATE);

        this.node.layout.updateLayout();
        this.content.layout.updateLayout();


        let oldEnableScroll = this.scrollView.enabled;
        this.scrollView.enabled = showScrollBar;

        this.scheduleOnce(() => {
            this.node.active = false;
            this.node.active = true;
            if ((oldEnableScroll != showScrollBar && showScrollBar) || !showScrollBar) {
                this.scrollView.scrollToTop();
            }
        });
    }

    public left() {

        this._isLeft = true;
        return this;
    }

    public right() {

        this._isLeft = false;
        return this;
    }

}
