import { game, _decorator } from "cc";
import { LoadingTips } from "../prefabs/LoadingTips";
const { ccclass } = _decorator;
const { plugin } = tnt._decorator;



@plugin('SceneMgr') // 注册成为插件
@ccclass('ScenePlugin')
export class ScenePlugin implements ISceneMgrPlugin {

    name: string = "ScenePlugin";

    loadingTipsPromise: Promise<LoadingTips> = null;
    private constructor() {

    }
    
    onPluginRegister?() {
        console.log(`ScenePlugin-> 插件注册完成`);

    }
    onPluginUnRegister?() {
        
    }
    async onSceneChangeBegin(currentScene: string, nextScene: string) {
        let lock = tnt.panelMgr.getLayer(tnt.panelMgr.Enum.LayerLock);
        if(!this.loadingTipsPromise){
            this.loadingTipsPromise = tnt.resourcesMgr.addPrefabNode(tnt.loaderMgr.share,LoadingTips,lock);
           console.log(`ScenePlugin-> 顺序执行显示菊花`);           
            this.loadingTipsPromise.then(()=>{
                console.log(`ScenePlugin-> 显示菊花`);
                console.time('[tnt] 展示菊花');
                
            });
        }else{
            this.loadingTipsPromise.then((res)=>{
                console.time('[tnt] 展示菊花');
                res.node.parent = lock;
                console.log(`ScenePlugin-> 显示菊花`);
            });
        }
    }

    onSceneChangeEnd(previousScene: string, currentScene: string) {

    }
    
    /** 进入新场景后的过渡动画开始 */
    onEnterTransitionStart?(sceneName: string) {
        console.log(`ScenePlugin-> 进入新场景，过渡动画开始  ${sceneName || "LoadingScene"}`);

    }
    /** 进入新场景后的过渡动画将要结束 */
    onEnterTransitionWillFinished?(sceneName: string) {
        console.log(`ScenePlugin-> 进入新场景，过渡动画将要结束  ${sceneName || "LoadingScene"}`);

    }
    /** 进入新场景后的过渡动画结束 */
    onEnterTransitionFinished?(sceneName: string) {
        console.log(`ScenePlugin-> 进入新场景，过渡动画结束  ${sceneName || "LoadingScene"}`);

    }


    /** 退出场景，过渡动画开始 */
    onExitTransitionStart?(sceneName: string) {
        console.log(`ScenePlugin-> 退出场景，过渡动画开始  ${sceneName || "LoadingScene"}`);
        // 隐藏菊花
        console.log(`ScenePlugin-> 顺序执行隐藏菊花`);
        if(this.loadingTipsPromise){
            this.loadingTipsPromise.then((res)=>{
                console.log(`ScenePlugin-> 隐藏菊花`);
                console.timeEnd('[tnt] 展示菊花');
                res.node.removeFromParent();
            });
          
        }

    }
    /** 退出场景，过渡动画将要结束 */
    onExitTransitionWillFinished?(sceneName: string) {
        console.log(`ScenePlugin-> 退出场景，过渡动画将要结束  ${sceneName || "LoadingScene"}`);

    }
    /** 退出场景，过渡动画结束 */
    onExitTransitionFinished?(sceneName: string) {
        console.log(`ScenePlugin-> 退出场景，过渡动画结束  ${sceneName || "LoadingScene"}`);

    }

    private static _instance: ScenePlugin = null
    public static getInstance(): ScenePlugin {
        if (!this._instance) {
            this._instance = new ScenePlugin();
        }
        return this._instance;
    }
}
