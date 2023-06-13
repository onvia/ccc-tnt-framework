# 拖放管理

类 `DragDropMgr`  

## 自由拖动
设置节点的 `draggable` 属性可以实现拖动效果
```
node.draggable = true;
```

拖动开始、拖动的过程和拖动结束都可以获得通知
```

node.on(Node.DragEvent.DRAG_START, this.onDragStart, this);
node.on(Node.DragEvent.DRAG_MOVE, this.onDragMove, this);
node.on(Node.DragEvent.DRAG_END, this.onDragEnd, this);

```

## 转换拖动
如果不希望触摸节点的任何地方都可以拖动，那么可以用转换拖动的方式。  
例如一个窗口，触摸标题栏拖动整个窗口
```
_dragArea.draggable = true;
_dragArea.on(Node.DragEvent.DRAG_START, this.onDragAreaDragStart, this);

onDragAreaDragStart(event: Event) {
    let currentTarget = event.currentTarget as Node;
    
    //取消对原目标的拖动，换成一个替代品
    currentTarget.stopDrag();
    
    currentTarget.parent.startDrag();
}

```

## 替身拖动

替身拖动，顾名思义就是显示一个与原始节点相同的替身去进行拖动。替身拖动需要一个 触摸检测面板，如果没有实现，则会自动创建一个
```

// 触摸检测面板
let touchPanel: Node = null;

// 注册点击代理节点
tnt.dragDropMgr.on(this, true, touchPanel);

// 在不传入 touch 检测面板的时候，会自动生成一个面板
// dragDropMgr.on(this,true);


// 添加容器节点（放置点）
tnt.dragDropMgr.addContainer(container);



// 替身拖动需要实现 `IDragDropListener` 接口


/**
 * 必选
 * 获取显示拖拽代理所需要的数据
 */
onCreateDragAgentData(touchTarget: Node, uiLocation: Vec2): IDragAgentData {
    let dragSprite = touchTarget.getComponent(Sprite);
    return {
        icon: dragSprite.spriteFrame, // SpriteFrame | Node
        sourceData: dragSprite.color.clone(), // 【传递】的数据是颜色
        onShow: (node) => { // 替身显示后的回调
            node.scale = new Vec3(2, 2, 2); // 对替身进行 2 倍缩放
        }
    }
}

/**
 * 必选
 * 拖放
 */
onDropAgent(container: Node, dragAgent: Node, sourceData: any) {
    if (!container) {
        return;
    }
    // 将容器的颜色设置为 onCreateDragAgentData 中传入的 sourceData
    let sprite = container.getComponent(Sprite);
    sprite.color = sourceData; // 【接收】【传递】的数据
    
}

// /**
//  * 可选
//  * 触摸到监听面板，可以在这里做一些游戏逻辑的处理
//  */
// onTouchTestPanelStart?(event: EventTouch) {
//     
// }
// /**
//  * 可选
//  * 在监听面板上移动，可以在这里做一些游戏逻辑的处理
//  */
// onTouchTestPanelMove?(event: EventTouch) {
//     
// }
// /**
//  * 可选
//  * 触摸监听面板结束，可以在这里做一些游戏逻辑的处理
//  */
// onTouchTestPanelEnd?(event: EventTouch) {
//     
// }
// /**
//  * 可选
//  * 取消触摸监听面板，可以在这里做一些游戏逻辑的处理
//  */
// onTouchTestPanelCancel?(event: EventTouch) {
//     
// }
/**
//  * 可选
//  * 如果不实现此方法则使用默认的方法查找被按压的节点
//  */
// onFindTarget?(event: EventTouch, dragNodes: Node[]): Node {
//    return null; 
// }
// /**
//  * 可选
//  * 查找与被拖拽节点相交的容器
//  */
// onFindContainer?(dragAgent: Node, containers: Node[], intersects: (node1: Node, node2: Node) => boolean): Node {
//     return null;
// }
```




具体使用请查看脚本 `DragDropScene`，场景同名  
效果如下

![img](../readme-img/img3.gif)
