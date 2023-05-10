
import { Component, Node, macro, _decorator, assetManager } from "cc";
import { startupOptions } from "./BootstarapConfig";
import { KeyBoardListener } from "./listeners/KeyBoardListener";
import { SceneListener } from "./listeners/SceneListener";
const { ccclass, property } = _decorator;

/**
 * 启动类在 main 包，需要挂载到 Launcher 场景
 *
 */
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
        
        // 首先加载框架 
        assetManager.loadBundle("framework", () => {
            // 添加任务： 加载 游戏 bundle
            tnt.taskMgr.addTask((progress,done)=>{
                tnt.AssetLoader.loadBundle("game", () => {
                    done();
                });
            });
            
            // 执行任务
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

        // 启动框架
        tnt.startup(startupOptions);
        // 键盘事件
        tnt.keyboard.on(KeyBoardListener.getInstance());
        // 场景切换监听
        tnt.sceneMgr.addSceneListener(SceneListener.getInstance());

        // 显示开始按钮
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
