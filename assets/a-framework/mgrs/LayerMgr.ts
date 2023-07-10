
import { Layers, _decorator } from "cc";
const { ccclass, property } = _decorator;

declare global {
    interface ITNT {
        layerMgr: LayerMgr;
    }
}

/**
 * 此 Layer 为节点分组，并非 节点树中的层级，节点树层级管理请使用 PanelMgr
 */
@ccclass('LayerMgr')
class LayerMgr {

    getLayerByName(name: string) {
        let layer = Layers.nameToLayer(name);
        if (layer === 0 && name != "NONE") {
            for (let i = 0; i < 19; i++) {
                let _name = Layers.layerToName(i);
                if (typeof _name === 'undefined') {
                    layer = i;
                    Layers.addLayer(name, layer);
                    break;
                }
            }
        }
        return (1 << layer);
    }

    private static _instance: LayerMgr = null
    public static getInstance(): LayerMgr {
        if (!this._instance) {
            this._instance = new LayerMgr();
        }
        return this._instance;
    }
}

tnt.layerMgr = LayerMgr.getInstance();
export { };