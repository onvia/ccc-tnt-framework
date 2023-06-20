
import { director, EventKeyboard, js, KeyCode, _decorator } from "cc";
import { SceneConfig } from "../SceneConfig";
const { ccclass, property } = _decorator;



@ccclass('KeyBoardListener')
export class KeyBoardListener implements IKeyboard {
    count = 0;
    private constructor() {

    }
    onKeyBack(event: EventKeyboard) {

        if (tnt.uiMgr.closeWindow()) {
            return;
        }

        let scene = director.getScene();
        let scenename = scene.name;
        if (scenename === 'MainScene') {

            tnt.toast.show(`无法返回上一场景`, 1.5, 0, true);
            return;
        }

        let preScene = tnt.sceneMgr.getPreviousScene();
        if (!preScene) {
            return;
        }

        this.toScene(preScene, () => {
            let config = this.getSceneConfig(preScene);
            if(config){               
                tnt.sceneMgr.to(config.scene as any, { bundle: config.bundle });
                return;
            }
            
            tnt.sceneMgr.to("MainScene", { bundle: "main-scene" });
        });
    }

    toScene(preScene, toFn: () => void) {
        if (tnt.sceneMgr.isTransform) {
            return;
        }
        if (this.count >= 1) {
            tnt.toast.clear();
            this.count = 0;
            toFn();
        } else {
            this.count++;
            tnt.toast.show(`再按一次退出到 ${preScene}`);
            setTimeout(() => {
                this.count = 0;
            }, 2000);
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.F5) {
            let currentScene = tnt.sceneMgr.getCurrentScene();
            let clazz = js.getClassByName(currentScene);
            if (!clazz) {
                console.log(`KeyBoardListener-> 不存在场景类 ${currentScene}`);

                return;
            }

            let config = this.getSceneConfig(currentScene);

            tnt.sceneMgr.to(config.scene as any, { bundle: config.bundle });
        }
    }

    getSceneConfig(sceneName: string) {
        let config = SceneConfig.find((value) => {
            return value.scene == sceneName;
        });
        return config;
    }

    onKeyDown(event: EventKeyboard) {

    }
    onKeyCombination(ctrlKey: KeyCode, mainKey: KeyCode) {
        console.log(`KeyBoardListener->onKeyCombination `, KeyCode[ctrlKey], KeyCode[mainKey]);
    }
    onKeyCombinationPressing(ctrlKey: KeyCode, mainKey: KeyCode) {
        console.log(`KeyBoardListener->onKeyCombinationPressing `, KeyCode[ctrlKey], KeyCode[mainKey]);
    }
    onKeyPressing(event: EventKeyboard) {
        console.log(`KeyBoardListener->onKeyPressing `, event.keyCode);

    }

    private static _instance: KeyBoardListener = null
    public static getInstance(): KeyBoardListener {
        if (!this._instance) {
            this._instance = new KeyBoardListener();
        }
        return this._instance;
    }
}
