import { _decorator, Component, Node, UITransform, math, Vec3, Mat4, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PixelClickDemo')
export class PixelClickDemo extends tnt.SceneBase {

    onEnterTransitionStart() {

        let Layout1 = this.getNodeByName("Layout1");
        Layout1.children.forEach((child) => {
            tnt.hitTest.enablePixelHitTest(child.uiTransform);
        });
        let Layout2 = this.getNodeByName("Layout2");
        Layout2.children.forEach((child) => {
            tnt.hitTest.enablePixelHitTest(child.uiTransform);
            
            // setTimeout(() => {
            //     tnt.hitTest.enablePixelHitTest(child.uiTransform, false);
            // }, 5000);
        });
    }

}

