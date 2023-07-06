
import { Node, find, Layers, _decorator, UITransform, view } from "cc";
const { ccclass, property } = _decorator;



declare global {
    interface ITNT {
        panelMgr: PanelMgr;
    }
}

enum PanelNameEnum {
    LayerUIRoot = 1, // 弹窗层
    LayerEffect = 2, // 特效层
    LayerTip = 3, // 提示层
    LayerSys = 4, // 系统层
    LayerLock = 5, // 锁定层 屏蔽所有输入事件
}

@ccclass('PanelMgr')
class PanelMgr {

    Enum = PanelNameEnum;
    root: Node = null;

    lazyInit() {
        this.root = find("Canvas");
    }

    getLayer(layerNameEnum: PanelNameEnum) {
        this.lazyInit();
        let layerName = PanelNameEnum[layerNameEnum];
        layerName = layerName.replace("Layer","");
        let node = this.root.getChildByName(layerName);
        if (!node) {
            node = new Node(layerName);
            let transform = node.addComponent(UITransform);
            transform.setContentSize(view.getVisibleSize());
            transform.priority = layerNameEnum; // 根据枚举值进行排序
            node.parent = this.root;
            node.layer = this.root.layer;
        }

        return node;
    }


    private static _instance: PanelMgr = null
    public static getInstance(): PanelMgr {
        if (!this._instance) {
            this._instance = new PanelMgr();
        }
        return this._instance;
    }
}

const panelMgr = PanelMgr.getInstance();
tnt.panelMgr = panelMgr;
export { };