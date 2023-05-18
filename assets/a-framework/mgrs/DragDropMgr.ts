import { Node, EventTouch, _decorator, Sprite, UITransform, Layers, UIOpacity, isValid, SpriteFrame, Vec3, Vec2, Canvas, director, Mat4, Rect } from "cc";
import { DEV } from "cc/env";

const { ccclass } = _decorator;

const _matrix = new Mat4();
const _worldMatrix = new Mat4();

declare global {
    interface ITNT {
        dragDropMgr: DragDropMgr;
    }
    interface IDragAgentData {
        /**
         * 拖拽时显示的 SpriteFrame 或 Node
         *
         * @type {(SpriteFrame | Node)}
         * @memberof IDragAgentData
         */
        icon?: SpriteFrame | Node,
        /**
         * 拖拽时候所携带的数据，在放置的时候会传给 onDropDragAgent 方法
         *
         * @type {*}
         * @memberof IDragAgentData
         */
        sourceData?: any;

        /**
         * 可以对显示的节点进行处理
         *
         * @memberof IDragAgentData
         */
        onShow: (node: Node) => void;
    }

    interface IDragDropListener<SourceData = any> {

        /**
         * 点击到监听面板，可以在这里做一些游戏逻辑的处理
         *
         * @param {EventTouch} event
         * @memberof IDragDropListener
         */
        onTouchTestPanelStart?(event: EventTouch);

        /**
         * 在监听面板上移动，可以在这里做一些游戏逻辑的处理
         *
         * @param {EventTouch} event
         * @memberof IDragDropListener
         */
        onTouchTestPanelMove?(event: EventTouch);

        /**
         * 点击监听面板结束，可以在这里做一些游戏逻辑的处理
         *
         * @param {EventTouch} event
         * @memberof IDragDropListener
         */
        onTouchTestPanelEnd?(event: EventTouch);
        /**
         * 取消点击监听面板，可以在这里做一些游戏逻辑的处理
         *
         * @param {EventTouch} event
         * @memberof IDragDropListener
         */
        onTouchTestPanelCancel?(event: EventTouch);


        /**
         * 如果不实现此方法则使用默认的方法查找
         *
         * @param {EventTouch} event
         * @param {Array<Node>} dragNodes
         * @return {*}  {Node}
         * @memberof IDragDropListener
         */
        onFindTarget?(event: EventTouch, dragNodes: Array<Node>): Node;

        /**
         * 查找容器
         *
         * @param {Node} dragAgent 被拖拽的节点
         * @param {Array<Node>} containers 容器数组
         * @param {(node1: Node, node2: Node) => boolean} intersects 一个判断是否相交的默认方法
         * @return {*}  {Node}
         * @memberof IDragDropListener
         */
        onFindContainer?(dragAgent: Node, containers: Array<Node>, intersects: (node1: Node, node2: Node) => boolean): Node;

        /**
         * 获取显示拖拽代理所需要的数据
         *
         * @param {Node} touchTarget
         * @param {Vec2} uiLocation
         * @return {*}  {IDragAgentData}
         * @memberof IDragDropListener
         */
        onCreateDragAgentData(touchTarget: Node, uiLocation: Vec2): IDragAgentData;

        /**
         * 拖放监听
         *
         * @param {Node} container
         * @param {Node} dragAgent
         * @param {SourceData} sourceData
         * @memberof IDragDropListener
         */
        onDropDragAgent(container: Node, dragAgent: Node, sourceData: SourceData);
    }
}
const NAME_AGENTICON = "AgentIcon";
let tmp_v3_1 = new Vec3();
@ccclass('DragDropMgr')
export class DragDropMgr<SourceData = any> {
    private dragDropListener: IDragDropListener<SourceData>;
    private sourceData: SourceData = null;
    public dragAgent: Node = null;


    //容器数组，为了做位置的判断
    private containers: Array<Node> = [];
    // 需要拖拽的节点
    private dragNodes: Array<Node> = [];

    // 点击面板
    private touchTestPanel: Node = null;
    private touchTransform: UITransform = null;
    private touchStartPositon: Vec3 = null;
    private isTouching = false;
    private delayShowDragAgent: Runnable = null;


    private autoRemove = true;

    private _delayMap = new Map<string, number>();
    private _clickEventMap = new Map<string, TouchEventFunc>();
    private _delayShowTimer = null;
    private _currentTarget: Node = null;

    public get dragging(): boolean {
        return this.dragAgent?.parent != null;
    }


    constructor() {
    }

    private lazyInit() {
        if (!this.dragAgent || !isValid(this.dragAgent)) {
            this.dragAgent = new Node();
            this.dragAgent.name = "AUTO_NAME_DRAG_AGENT";
            this.dragAgent.layer = Layers.Enum.UI_2D;
            this.dragAgent.addComponent(UITransform);
            this.dragAgent.addComponent(UIOpacity);
            let sprite = this.dragAgent.addComponent(Sprite);
            sprite.sizeMode = Sprite.SizeMode.RAW;
            sprite.type = Sprite.Type.SIMPLE;
            sprite.trim = false;
            // this.dragAgent.draggable = true;
            this.dragAgent.on(Node.DragEvent.DRAG_END, this.onDragEnd, this);
        }
    }
    /**
     * 注册监听器
     * @param dragDropListener 监听者
     * @param autoRemoveAgent 自动移除代理节点
     * @param touchTestPanel touch 检测节点 如果不传入则根据不同情况自动添加一个
     */
    public on(dragDropListener: IDragDropListener, autoRemoveAgent: boolean = true, touchTestPanel?: Node) {
        if (!touchTestPanel) {
            let targetNode: Node = null;
            // 如果传入的 监听器本身就是节点，则直接使用
            if (dragDropListener instanceof Node) {
                targetNode = dragDropListener;
            }
            // @ts-ignore 
            // 如果传入的 监听器持有节点，则直接使用
            else if (dragDropListener.node && dragDropListener.node instanceof Node) {
                // @ts-ignore
                targetNode = dragDropListener.node;
            }
            if (targetNode) {
                let targetTransform = targetNode.getComponent(UITransform);
                touchTestPanel = new Node();
                touchTestPanel.layer = Layers.Enum.UI_2D;
                touchTestPanel.name = "AUTO_TOUCH_TEST_PANEL";
                let uiTransform = touchTestPanel.addComponent(UITransform);
                touchTestPanel.addComponent(UIOpacity);
                uiTransform.setContentSize(targetTransform.contentSize);
                touchTestPanel.parent = targetNode;
                touchTestPanel.position = new Vec3();
            } else {
                // 否则使用 画布节点
                let canvas = director.getScene().getComponentInChildren(Canvas);
                touchTestPanel = canvas.node;
            }
        }
        this.touchTransform = touchTestPanel.getComponent(UITransform);
        this.autoRemove = autoRemoveAgent;
        this.touchTestPanel = touchTestPanel;
        this.dragDropListener = dragDropListener;
        touchTestPanel.on(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        touchTestPanel.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        touchTestPanel.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        touchTestPanel.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

    }

    public off(target: IDragDropListener) {
        let touchTestPanel = this.touchTestPanel;
        touchTestPanel.off(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        touchTestPanel.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        touchTestPanel.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        touchTestPanel.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.clear();
    }

    /**
     * 添加拖放容器
    */
    public addContainer(node: Node) {
        this.containers.push(node);
    }

    /**
     * 移除指定的拖放容器
    */
    public removeContainer(node: Node) {
        let idx = this.containers.indexOf(node);
        this.containers.splice(idx, 1);
    }

    /**
     * 移除所有的容器节点
     *
     * @memberof DragDropMgr
     */
    public removeAllContainer() {
        this.containers.length = 0;
    }
    /**
     * 移除所有注册的拖拽节点
     *
     * @memberof DragDropMgr
     */
    public remoeAllDragNode() {
        this.dragNodes.length = 0;
    }
    /**
     * 清理所有相关
     *
     * @memberof DragDropMgr
     */
    public clear() {
        this.remoeAllDragNode();
        this.removeAllContainer();
        this.clearTimer();
        if (this.dragAgent?.parent != null) {
            this.dragAgent.removeFromParent();
        }
    }

    /**
     * 注册单个拖拽节点
     * @param dragTarget 拖拽目标
     * @param delay 延迟弹出代理
     * @param clickEvent 点击事件
     */
    public registerDragTarget(dragTarget: Node, delay: number = 0, clickEvent: TouchEventFunc = null) {
        if (!dragTarget) {
            console.error(`DragDropMgr-> dragTarget is null`);
            return;
        }
        if (this.dragNodes.indexOf(dragTarget) >= 0) {
            console.log(`DragDropMgr->已经注册过这个节点 ${dragTarget.name}`);
            return;
        }
        this.dragNodes.push(dragTarget);

        this._delayMap.set(dragTarget.uuid, delay);

        clickEvent && this._clickEventMap.set(dragTarget.uuid, clickEvent);
    }

    public unregisterDragTarget(dragTarget: Node) {
        let index = this.dragNodes.indexOf(dragTarget);
        index >= 0 && this.dragNodes.splice(index, 1);
    }


    /**
     * 生成拖拽代理节点
     *
     * @protected
     * @param {Node} source
     * @param {IDragAgentData} data
     * @return {*} 
     * @memberof DragDropMgr
     */
    protected startDrag(source: Node, data: IDragAgentData) {
        if (this.dragging) {
            return;
        }
        let { icon, sourceData, onShow } = data;

        this.lazyInit();
        this.sourceData = sourceData;

        this.dragAgent.scale = new Vec3(1, 1, 1);
        this.dragAgent.getComponent(UIOpacity).opacity = 255;

        //赋值 ico
        let dragIco = this.dragAgent.getComponent(Sprite);
        if (icon && icon instanceof SpriteFrame) {
            dragIco.spriteFrame = icon;
        } else {
            dragIco.spriteFrame = null;
            if (icon && icon instanceof Node) {
                icon.parent = this.dragAgent;
                icon.name = NAME_AGENTICON;
                icon.position = new Vec3();
            }
        }
        this.dragAgent.position = new Vec3(this.touchStartPositon.x, this.touchStartPositon.y, this.dragAgent.position.z);
        this.dragAgent.parent = this.touchTestPanel;
        this.dragAgent.startDrag();

        this.sourceData = sourceData;
        onShow(this.dragAgent);
        return this.dragAgent;
    }

    private onDragEnd() {
        if (this.dragAgent.parent == null) {
            return;
        }
        let dragAgent = this.dragAgent;
        let sourceData = this.sourceData;
        let containers = this.containers;
        let container = null;

        if (this.dragDropListener.onFindContainer) {
            container = this.dragDropListener.onFindContainer(dragAgent, containers, this.intersects);
        } else {
            for (let i = 0; i < containers.length; i++) {
                const tempContainer = containers[i];
                if (this.intersects(tempContainer, dragAgent)) {
                    container = tempContainer;
                    break;
                }
            }
        }

        if (container?.hasEventListener(Node.DragEvent.DROP)) {
            // 需要接收的参数有： 容器，拖拽物，源数据
            container.emit(Node.DragEvent.DROP, container, dragAgent, sourceData);
        }

        //
        this.dragDropListener?.onDropDragAgent(container, dragAgent, sourceData);
        //自动移除节点
        if (dragAgent.parent != null) {
            dragAgent.stopDrag();
            if (this.autoRemove) {
                this.removeDragAgent();
            }
        }
    }

    /**
     * 判断是否相交
     *
     * @param {Node} tempContainer
     * @param {Node} dragAgent
     * @return {*} 
     * @memberof DragDropMgr
     */
    public intersects(tempContainer: Node, dragAgent: Node) {
        //计算 dragAgent 的中心点 是否在 container 上
        //如果在 则 break,并给 container 发送 drop 事件
        let containerBox = this._getBoundingBoxToWorld(tempContainer);
        if (containerBox == undefined || containerBox == null) {
        }
        let dragAgentRect = this._getBoundingBoxToWorld(dragAgent);
        if (containerBox.intersects(dragAgentRect)) {
            return true;
        }
        return false;
    }

    /**
     * 计算世界包围盒，但不包含子节点
     *
     * @private
     * @param {Node} node
     * @return {*} 
     * @memberof DragDropMgr
     */
    private _getBoundingBoxToWorld(node: Node) {
        node.parent.getWorldMatrix(_worldMatrix);
        Mat4.fromRTS(_matrix, node.getRotation(), node.getPosition(), node.getScale());
        const width = node.uiTransform.contentSize.width;
        const height = node.uiTransform.contentSize.height;
        const rect = new Rect(
            -node.uiTransform.anchorPoint.x * width,
            -node.uiTransform.anchorPoint.y * height,
            width,
            height,
        );

        Mat4.multiply(_worldMatrix, _worldMatrix, _matrix);
        rect.transformMat4(_worldMatrix);

        return rect;
    }
    
    public removeDragAgent() {
        let icon = this.dragAgent.getChildByName(NAME_AGENTICON);
        if (icon) {
            icon.destroy();
        }
        this.dragAgent.removeFromParent();
    }
    private onTouchBegin(event: EventTouch) {
        event.preventSwallow = true;
        this.dragDropListener?.onTouchTestPanelStart?.(event);
        let pos = event.getUILocation();
        tmp_v3_1.set(pos.x, pos.y);
        this.touchStartPositon = this.touchTransform.convertToNodeSpaceAR(tmp_v3_1, this.touchStartPositon);
        let node = this.findTouchedNode(event);
        if (!node) {
            return;
        }
        this.isTouching = true;
        this._currentTarget = node;
        // 点击开始延迟 n 秒之后弹出拖拽代理节点
        this.delayShowDragAgent = () => {
            // 延迟之后判断是否是按压状态
            if (this.isTouching) {
                this.isTouching = false;
                let data = this.dragDropListener?.onCreateDragAgentData(node, event.getUILocation());
                this.startDrag(node, data);
            }
            this._delayShowTimer = null;
        }
        let delay = this._delayMap.get(node?.uuid) || 0;

        this.clearTimer();
        if (delay === 0) {
            this.delayShowDragAgent();
        } else {
            this._delayShowTimer = setTimeout(this.delayShowDragAgent, delay * 1000);
        }
    }
    private onTouchMove(event: EventTouch) {
        // 在有拖拽代理的时候 事件不允许派发给渲染在下一层级的节点
        if (this.dragAgent && this.dragAgent.activeInHierarchy) {
            event.preventSwallow = false;
            this.dragAgent.emit(Node.EventType.TOUCH_MOVE, event);
        } else {
            let location = event.getUILocation();
            let startLocation = event.getUIStartLocation();
            // 这里做下处理，如果位移超过 10 像素，则代表不能进行拖拽
            if (Math.abs(startLocation.x - location.x) > 10 || Math.abs(startLocation.y - location.y) > 10) {
                this.isTouching = false;
                this.clearTimer();
            }
            event.preventSwallow = true;
        }
        this.dragDropListener?.onTouchTestPanelMove?.(event);
    }
    private onTouchEnd(event: EventTouch) {
        if (this.dragAgent && this.dragAgent.activeInHierarchy) {
            this.dragAgent.emit(Node.EventType.TOUCH_END, event);
        } else {
            if (this.isTouching && this._currentTarget) {
                if (this._clickEventMap.has(this._currentTarget.uuid)) {
                    let clickEventFunc = this._clickEventMap.get(this._currentTarget.uuid);
                    const clickEvent = new EventTouch(event.getTouches(), event.bubbles, Node.EventType.TOUCH_END);
                    clickEvent.touch = event.touch;
                    clickEvent.simulate = true;
                    clickEvent.currentTarget = this._currentTarget;
                    clickEventFunc?.(clickEvent);
                }
                this._currentTarget = null;
            }
        }
        this.isTouching = false;
        this.clearTimer();
        event.preventSwallow = true;
        this.dragDropListener?.onTouchTestPanelEnd?.(event);
    }
    private onTouchCancel(event) {
        if (this.dragAgent && this.dragAgent.activeInHierarchy) {
            this.dragAgent.emit(Node.EventType.TOUCH_CANCEL, event);
        }
        event.preventSwallow = true;
        this.dragDropListener?.onTouchTestPanelCancel?.(event);
    }

    /** 查找被按压的节点 */
    private findTouchedNode(event: EventTouch) {
        if (this.dragDropListener?.onFindTarget) {
            let node = this.dragDropListener?.onFindTarget(event, this.dragNodes);
            if (node) {
                return node;
            }
            DEV && console.log(`DragDropMgr->  通过 dragDropListener.onFindTarget 没有查找到目标节点`);
        }
        let touchPos = event.getUILocation();
        for (let index = 0; index < this.dragNodes.length; index++) {
            const node = this.dragNodes[index];
            if (!node.activeInHierarchy) {
                continue;
            }
            let uiTransform = node.getComponent(UITransform);
            let box = uiTransform.getBoundingBoxToWorld();
            if (box.contains(touchPos)) {
                return node;
            }
        }
        return null;
    }

    private clearTimer() {
        if (this._delayShowTimer != null) {
            clearTimeout(this._delayShowTimer);
            this._delayShowTimer = null;
        }
    }

    private static _instance: DragDropMgr = null
    public static getInstance(): DragDropMgr {
        if (!this._instance) {
            this._instance = new DragDropMgr();
        }
        return this._instance;
    }
}


tnt.dragDropMgr = DragDropMgr.getInstance();
export { };