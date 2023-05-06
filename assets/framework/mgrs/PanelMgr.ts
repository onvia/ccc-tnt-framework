
import { Node, find, Layers, _decorator, UITransform, view } from "cc";
const { ccclass, property } = _decorator;



declare global {
    interface ITNT {
        panelMgr: PanelMgr;
    }
}

enum PanelNameEnum {
    LayerEffect = 0,
    LayerTip = 1,
    LayerLock = 2,
    LayerPopup = 3,
    LayerSys = 4,
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
        let node = this.root.getChildByName(layerName);
        if (!node) {
            node = new Node(layerName);
            let transform = node.addComponent(UITransform);
            transform.setContentSize(view.getVisibleSize());
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