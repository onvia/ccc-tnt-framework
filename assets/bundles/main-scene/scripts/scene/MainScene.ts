import { _decorator, Component, Node, instantiate } from 'cc';
import { SceneConfig } from '../../../../launcher/SceneConfig';
const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends tnt.SceneBase {

    onEnterTransitionStart(sceneName?: string): void {
        let btnTemplate = this.getNodeByName("btnTemplate");
        let parent = btnTemplate.parent;
        btnTemplate.removeFromParent();
        for (let i = 0; i < SceneConfig.length; i++) {
            const element = SceneConfig[i];
            let btn = instantiate(btnTemplate);
            btn.name = `btn${element.scene}`;
            btn.parent = parent;
            let label = btn.getChildByName("Label");
            this.setLabelText(label, element.button);
            this.registerButtonClick(btn, () => {
                tnt.sceneMgr.to(element.scene as any, { bundle: element.bundle });
            });
        }

        this.registerButtonClick("btnGitHub", () => {
            window.open("https://github.com/onvia/ccc-tnt-framework")
        });

        this.registerButtonClick("btnGitee", () => {
            window.open("https://gitee.com/onvia/ccc-tnt-framework")
        });
        // tnt.btnCommonEventMgr.bind(this);
    }

    onEnterTransitionFinished(sceneName?: string): void {

    }

}

