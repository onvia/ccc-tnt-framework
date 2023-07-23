import { color, Event, EventTouch, instantiate, Node, randomRangeInt, Sprite, Vec2, Vec3, _decorator } from "cc";
const { ccclass, property } = _decorator;


@ccclass('DragDropScene')
export class DragDropScene extends tnt.SceneBase implements IDragDropListener {

    //#region ----------- 转换拖动------------

    onEnter(): void {
        // 转换拖动
        let _dragArea = this.find("dragArea");
        _dragArea.draggable = true;
        _dragArea.on(Node.DragEvent.DRAG_START, this.onDragAreaDragStart, this);
    }

    onDragAreaDragStart(event: Event) {
        let curTarget = event.currentTarget as Node
        curTarget.stopDrag();
        curTarget.parent.startDrag();
    }

    //#endregion ----------- 转换拖动------------


    //#region -------------- 替身拖动 ------------
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

        this.registerButtonClick("Button", () => {
            console.log(`DragDropScene-> click Button`);
        });

        // 对需要拖拽的节点注册监听，
        tnt.dragDropMgr.registerDragTarget(dragNode, 0);

        // 对列表节点进行拖拽注册
        let content = this.find('content');
        content.children.forEach(element => {
            element.sprite.color = color(randomRangeInt(0, 255), randomRangeInt(0, 255), randomRangeInt(0, 255));
            tnt.dragDropMgr.registerDragTarget(element, 0.2, (event) => {
                let node = event.currentTarget as Node;
                console.log(`DragDropScene-> click `, node.name);

                node.sprite.color = color(randomRangeInt(0, 255), randomRangeInt(0, 255), randomRangeInt(0, 255));

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
            icon: instantiate(touchTarget), // SpriteFrame | Node
            sourceData: dragSprite.color.clone(), // 【传递】的数据是颜色
        }
    }

    //必选 拖放到容器
    onDropAgent(container: Node, dragAgent: Node, sourceData: any) {
        if (!container) {
            return;
        }
        let sprite = container.getComponent(Sprite);
        sprite.color = sourceData; // 【接收】【传递】的数据
    }
    
    //#endregion -------------- 替身拖动 --------------
}

