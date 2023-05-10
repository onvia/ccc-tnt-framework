import { color, EventTouch, Node, randomRangeInt, Sprite, Vec2, Vec3, _decorator } from "cc";
const { ccclass, property } = _decorator;


@ccclass('DragDropScene')
export class DragDropScene extends tnt.SceneBase implements IDragDropListener {
    
    onEnterTransitionWillFinished(sceneName?: string): void {
        let dragNode = this.find('dragNode');
        let container = this.find('container');
        let touchPanel = this.find("TouchPanel");
        let dragLabel = this.find('dragLabel');
        dragLabel.draggable = true;

        // 注册点击代理节点
        tnt.dragDropMgr.on(this, true, touchPanel);

        // 在不传入 touch 检测面板的时候，会自动生成一个面板
        // dragDropMgr.on(this,true);


        // 添加容器节点（放置点）
        tnt.dragDropMgr.addContainer(container);

        this.registeButtonClick("Button", () => {
            console.log(`DragDropScene-> click Button`);
        });

        // 对需要拖拽的节点注册监听，
        tnt.dragDropMgr.registerDragTarget(dragNode, 0);

        // 对列表节点进行拖拽注册
        let content = this.find('content');
        content.children.forEach(element => {
            tnt.dragDropMgr.registerDragTarget(element, 0.2, (event) => {
                let node = event.currentTarget;
                console.log(`DragDropScene-> click `, node.name);

                let sprite = node.getComponent(Sprite);
                sprite.color = color(randomRangeInt(0, 255), randomRangeInt(0, 255), randomRangeInt(0, 255));

            });
        });

    }

    onExitTransitionStart(sceneName?: string): void {
        // 移除监听
        tnt.dragDropMgr.off(this);
    }

    //必选 创建拖拽代理
    onCreateDragAgentData(touchTarget: Node, uiLocation: Vec2): IDragAgentData {
        let dragSprite = touchTarget.getComponent(Sprite);
        return {
            icon: dragSprite.spriteFrame,
            sourceData: dragSprite.spriteFrame,
            onShow: (node)=>{
                node.scale = new Vec3(2,2,2);
            }
        }
    }

    //必选 拖放到容器
    onDropDragAgent(container: Node, dragAgent: Node, sourceData: any) {
        if (!container) {
            return;
        }
        let sprite = container.getComponent(Sprite);
        sprite.color = color(randomRangeInt(0, 255), randomRangeInt(0, 255), randomRangeInt(0, 255));
    }

    // 可选
    // onFindTarget(event: EventTouch, dragNodes: Array<Node>): Node{
    //     return null;
    // }

    // // 可选 
    // onFindContainer(dragAgent: Node, containers: Array<Node>, intersects: (node1: Node, node2: Node) => boolean): Node{
    //     return null;
    // }


    // 可选
    onTouchTestPanelStart(event: EventTouch) {
        console.log(`DragDropScene-> onTouchTestPanelStart`);

    }
    // 可选
    onTouchTestPanelMove(event: EventTouch) {
        console.log(`DragDropScene-> onTouchTestPanelMove`);

    }
    // 可选
    onTouchTestPanelEnd(event: EventTouch) {
        console.log(`DragDropScene-> onTouchTestPanelEnd`);

    }
    // 可选
    onTouchTestPanelCancel(event: EventTouch) {
        console.log(`DragDropScene-> onTouchTestPanelCancel`);

    }
}
