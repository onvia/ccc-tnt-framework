
import { director, EventKeyboard, Node, find, js, KeyCode, v3, _decorator, Canvas } from "cc";
import { SceneConfig } from "../SceneConfig";
const { ccclass, property } = _decorator;



@ccclass('KeyBoardListener')
export class KeyBoardListener implements IKeyboard {
    count = 0;
    private constructor() {
        let btnBack = find("Canvas/btnBack");
        // let worldPos = btnBack.uiTransform.convertToWorldSpaceAR(v3());
        btnBack.removeFromParent();
        btnBack.sprite.spriteFrame.addRef();
        tnt.componentUtils.registerButtonClick(btnBack, () => {
            this.onKeyBack(null)
        }, this, null);



        let canvasNode = new Node();
        canvasNode.addComponent(Canvas);

        let canvas = find("Canvas");
        canvasNode.position = canvas.position.clone();
        canvasNode.name = "BackBtnCanvas";
        director.addPersistRootNode(canvasNode);
        btnBack.parent = canvasNode;

        // let localPos = btnBack.uiTransform.convertToNodeSpaceAR(worldPos);
        // btnBack.setPosition(localPos);
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
            let element = SceneConfig.find((element)=>{
                return element.scene == scenename;
            });

            if(element && scenename !== 'MainScene' && scenename !== "Launcher"){
                this.toMainScene();
                return;
            }

            tnt.toast.show(`无法返回上一场景`, 1.5, 0, true);
            return;
        }

        let changeScene = () => {
            let config = this.getSceneConfig(preScene);
            if (config) {
                tnt.sceneMgr.to(config.scene as any, { bundle: config.bundle });
                return;
            }

            this.toMainScene();
        };
        // event 事件不存在，代表按的是界面上的按钮，直接跳转
        if (!event) {
            changeScene();
            return;
        }


        this.toScene(preScene, changeScene);
    }

    toScene(preScene, toFn: () => void) {
        if (tnt.sceneMgr.isTransform) {
            return;
        }
        if (this.count >= 1) {
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
    toMainScene(){
        
        tnt.sceneMgr.to("MainScene", { bundle: "main-scene" });
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
        console.log(`KeyBoardListener->onKeyCombination `, KeyCode[ctrlKey], "+", KeyCode[mainKey]);
    }
    onKeyCombinationPressing(ctrlKey: KeyCode, mainKey: KeyCode) {
        console.log(`KeyBoardListener->onKeyCombinationPressing `, KeyCode[ctrlKey], "+", KeyCode[mainKey]);
    }
    onKeyPressing(event: EventKeyboard) {
        console.log(`KeyBoardListener->onKeyPressing `, KeyCode[event.keyCode]);

    }

    private static _instance: KeyBoardListener = null
    public static getInstance(): KeyBoardListener {
        if (!this._instance) {
            this._instance = new KeyBoardListener();
        }
        return this._instance;
    }
}
