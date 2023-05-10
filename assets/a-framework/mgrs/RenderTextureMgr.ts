
import { _decorator, Component, Node, RenderTexture } from 'cc';
const { ccclass, property } = _decorator;



declare global {
    interface ITNT {
        renderTextureMgr: RenderTextureMgr;
    }
}

let pool = new tnt.Pool<RenderTexture>({
    maxCount: 8,
    newObject() {
        return new RenderTexture();
    },
});

@ccclass('RenderTextureMgr')
class RenderTextureMgr {

    create() {
        return pool.get();
    }

    recycle(renderTexture: RenderTexture) {
        pool.put(renderTexture);
    }

    private static _instance: RenderTextureMgr = null
    public static getInstance(): RenderTextureMgr {
        if (!this._instance) {
            this._instance = new RenderTextureMgr();
        }
        return this._instance;
    }
}

const renderTextureMgr = RenderTextureMgr.getInstance();
tnt.renderTextureMgr = renderTextureMgr;

export { };