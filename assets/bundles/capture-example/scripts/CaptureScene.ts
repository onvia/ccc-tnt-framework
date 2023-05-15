import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CaptureScene')
export class CaptureScene extends tnt.SceneBase {

    content: Node = null;
    onEnter(): void {
        this.content = this.getNodeByName("content");
        this.registeButtonClick("btnFullscreen", this.onClickFullscreen);
        this.registeButtonClick("btnNode", this.onClickNode);
        this.registeButtonClick("btnClear", this.onClickClear);
    }

    onClickFullscreen() {
        let captureNode = tnt.captureMgr.captureScreenSync();
        captureNode.parent = this.content;
    }
    onClickNode() {
        let node = this.getNodeByName("Sprite");
        let captureNode = tnt.captureMgr.captureNodeSync(node);
        // let captureNode = tnt.captureMgr.captureNodeAsync(node);
        captureNode.parent = this.content;
    }
    onClickClear() {
        for (let i = this.content.children.length; i--;) {
            tnt.captureMgr.recycleCaptureNode(this.content.children[i]);
        }
    }
}

