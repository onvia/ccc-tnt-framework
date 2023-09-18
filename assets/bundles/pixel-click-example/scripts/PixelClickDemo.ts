import { _decorator, Component, Node, UITransform, math, Vec3, Mat4, Vec2, instantiate, v3, Sprite, EventTouch, v2, Color, Camera } from 'cc';
const { ccclass, property } = _decorator;
const { node, sprite, component } = tnt._decorator;

const _mat4_temp = new Mat4();
const _worldMatrix = new Mat4();
const _zeroMatrix = new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
const testPt = new Vec2();
const v2WorldPt = new Vec2();
const v3WorldPt = new Vec3();

@ccclass('PixelClickDemo')
export class PixelClickDemo extends tnt.SceneBase {

    @node()
    ClickTest: Node = null;

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



        this.ClickTest.children.forEach((child) => {
            tnt.hitTest.enablePixelHitTest(child.uiTransform);
            // this.registerButtonClick(child, (btn) => {
            //     // 点击后进行销毁
            //     btn.node.destroy();
            // })
        });

        // n 秒后更换图片
        // setTimeout(() => {
        //     let sheep_down_0 = this.getNodeByName("sheep_down_0");
        //     tnt.resourcesMgr.updateSpriteFrame(this, sheep_down_0, "common-bundle#textures/clover1");
        // }, 5000);
    }

}

