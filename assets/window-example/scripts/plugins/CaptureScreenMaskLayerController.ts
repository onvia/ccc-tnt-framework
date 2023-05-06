
import { _decorator, Node, Camera, UIOpacity, Sprite, Color, director, Canvas, EffectAsset } from 'cc';
import { DualBlurEffect } from '../../../framework/components/effect/DualBlurEffect';
const { ccclass, property } = _decorator;



// 截屏作为蒙版

@ccclass('CaptureScreenMaskLayerController')
export class CaptureScreenMaskLayerController implements IMaskLayerController {

    public enable = true;
    public camera: Camera = null;
    private _opacity = 126; // 可以看做是黑色蒙版的透明度
    dualBlurEffect: DualBlurEffect;
    
    /**
     * 黑色蒙版的透明度
     * @param {*} opacity 0 ~ 255 数值越大 越黑
     * @memberof CaptureScreen
     */
    setOpacity(opacity) {
        this._opacity = opacity;
    }

    onUIMgrInitialize() {
        if (!this.enable) {
            return;
        }

        let canvas = director.getScene().getComponentInChildren(Canvas);
        this.dualBlurEffect = canvas.node.addComponent(DualBlurEffect);

    }
    onWindowCreateBefore(windowName: string) {
        if (!this.enable) {
            return;
        }
    }
    onWindowCreateAfter(view: tnt.UIWindowBase<any>): Node {
        if (!this.enable) {
            return;
        }
        view.setMaskOpacity(255);
        let capNode = this.dualBlurEffect.captureScreen(5, 6);
        if (capNode) {
            if (!capNode.getComponent(UIOpacity)) {
                let opacity = capNode.addComponent(UIOpacity);
                opacity.opacity = 255;
            }
            let sprite = capNode.getComponent(Sprite);
            sprite.color = new Color(255 - this._opacity, 255 - this._opacity, 255 - this._opacity, 255);
        }
        return capNode;
    }
    onWindowDestroy(view: tnt.UIWindowBase<any>, mask: Node) {
        if (!this.enable) {
            return;
        }
        mask.destroy();
    }

    private static _instance: CaptureScreenMaskLayerController = null
    public static getInstance(): CaptureScreenMaskLayerController {
        if (!this._instance) {
            this._instance = new CaptureScreenMaskLayerController();
        }
        return this._instance;
    }
}
