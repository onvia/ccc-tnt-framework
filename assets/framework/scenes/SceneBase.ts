import { _decorator, Scene } from "cc";
const { ccclass, property } = _decorator;



let idx = 0;



//  生命周期 执行顺序
//  
//  onLoad 组件脚本加到节点上时被调用
//  onEnable 有父节点了，在 enable = true 时会被调用
//  onCreate 通过框架加载的预制体组件会有此方法
//  onLaunch 
//  onEnter
//  start(onStart) 延迟一帧被调用
//  onDisable 在 enable = false 时会被调用
//  onDestroy 节点销毁时被调用
//  onExit


declare global {

    interface ITNT {
        SceneBase: typeof SceneBase;
    }

    namespace tnt {
        type SceneBase<Options> = InstanceType<typeof SceneBase<Options>>;
    }
}
@ccclass('SceneBase')
class SceneBase<Options = any> extends tnt.UIBase<Options> implements ISceneListener, ILoaderKeyAble {

    scene: Scene = null;

    private _loader: tnt.AssetLoader = null;
    public get loader() {
        if (!this._loader) {
            this._loader = tnt.loaderMgr.get(this.loaderKey);
        }
        return this._loader;
    }

    protected __preload(): void {
        super.__preload();
        tnt.btnCommonEventMgr.bind(this);
    }

    /** 场景启动选项，已经跳转进场景，但是未显示*/
    onLaunch(scene: Scene) {
        this.scene = scene;
        tnt.loaderMgr.scene = this.loader;

    }

    /**
     * 刚进入场景
     *
     * @memberof SceneBase
     */
    onEnter() {

    }


    /**
     * 完全退出场景，组件和节点都已经为 无效 状态
     *
     * @memberof SceneBase
     */
    onExit() {

    }



    /** 进入场景，过渡动画开始 */
    onEnterTransitionStart(sceneName?: string) {

    }
    /** 进入场景，过渡动画将要结束 */
    onEnterTransitionWillFinished(sceneName?: string) {

    }
    /** 进入场景，过渡动画结束 */
    onEnterTransitionFinished(sceneName?: string) {

    }


    /** 退出场景，过渡动画开始 */
    onExitTransitionStart(sceneName?: string) {

    }
    /** 退出场景，过渡动画将要结束 */
    onExitTransitionWillFinished(sceneName?: string) {

    }
    /** 退出场景，过渡动画结束 */
    onExitTransitionFinished(sceneName?: string) {

    }
}
tnt.SceneBase = SceneBase;
export { };