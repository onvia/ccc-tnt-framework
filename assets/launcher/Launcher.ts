
import { Component, Node, macro, _decorator, assetManager } from "cc";
import { startupOptions } from "./StartupConfig";
import { KeyBoardListener } from "./listeners/KeyBoardListener";
import { SceneConfig } from "./SceneConfig";
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

        // 添加任务1： 加载 游戏 bundle
        tnt.taskMgr.addTask((progress, done) => {
            tnt.AssetLoader.loadBundle("main-scene", () => {
                done();
            });
        });
        // 添加任务2: 加载通用 bundle
        tnt.taskMgr.addTask((progress, done) => {
            tnt.AssetLoader.loadBundle("common-bundle", () => {
                tnt.resourcesMgr.loadPrefabAsset(tnt.loaderMgr.share, "LoadingTips");
                done();
            });
        });
        // 添加任务3: xxx

        // 执行任务
        tnt.taskMgr.startTasksParallel(() => {
            // 启动
            this.onLaunch();
        });
    }

    async onLaunch() {
        console.log(`Launcher-> 启动`);

        // 多点触控
        macro.ENABLE_MULTI_TOUCH = true;
        // 多语言
        tnt.i18n.enable = true;

        // 启动框架
        tnt.startup(startupOptions);
        // 键盘事件
        tnt.keyboard.on(KeyBoardListener.getInstance());


        let isSucc = await this.parseUrl();

        if(isSucc){            
            return;
        }
        // 显示开始按钮
        this.btnQuickStart.active = true;
    }

    async parseUrl() {
        const res = {};
        const search = window.location.search.substring(1);
        const paramArr = search.split('&');
        paramArr.forEach(item => {
            const itemArr = item.split('=');
            const key = itemArr[0];
            const value = itemArr[1];
            res[key] = value;
        });

        // 场景参数
        let scene = res["demo"];
        if(!scene){
            return false;
        }
        let element = SceneConfig.find((element)=>{
            return element.scene == scene
        });

        if(!element){
            console.error(`Launcher-> 没有 [${scene}] demo`);
            return false;
        }
        let result = await tnt.sceneMgr.to(element.scene as any,{bundle: element.bundle});

        return result;
    }

    onClickToExample() {
        tnt.sceneMgr.to('MainScene', { bundle: 'main-scene' });
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
