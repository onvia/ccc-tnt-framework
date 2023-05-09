
import { Component, Node, macro, _decorator, assetManager } from "cc";
import { bootstrapOptions } from "./BootstarapConfig";
import { KeyBoardListener } from "./listeners/KeyBoardListener";
import { SceneListener } from "./listeners/SceneListener";
const { ccclass, property } = _decorator;

@ccclass('Launcher')
export class Launcher extends Component {

    @property(Node)
    btnQuickStart: Node = null;

    protected onLoad?() {
        console.log(`Launcher-> onLoad`);
        this.btnQuickStart.active = false;
    }

    start() {
        console.log(`Launcher-> 加载基础 bundle`);
        
        assetManager.loadBundle("framework", () => {
            tnt.taskMgr.addTask((progress,done)=>{
                tnt.AssetLoader.loadBundle("game", () => {
                    done();
                });
            });

            tnt.taskMgr.startTasksParallel(()=>{
                this.onLaunch();
            });
        });
    }

    onLaunch() {
        console.log(`Launcher-> 启动`);
        
        // 多点触控
        macro.ENABLE_MULTI_TOUCH = true;
        // 启用键盘组合键
        tnt.keyboard.enableCombination = true;
        // 多语言
        tnt.i18n.enable = true;
        // 
        tnt.bootstrap(bootstrapOptions);
        tnt.keyboard.on(KeyBoardListener.getInstance());
        tnt.sceneMgr.addSceneListener(SceneListener.getInstance());

        this.btnQuickStart.active = true;
    }

    onClickToExample() {
        tnt.sceneMgr.to('MainScene');
    }

    protected onEnable?() {
        console.log(`Launcher-> onEnable`);

    }
    protected onDisable?() {
        console.log(`Launcher-> onDisable`);

    }
    protected onDestroy() {
        console.log(`Launcher-> onDestroy`);

    }

}
