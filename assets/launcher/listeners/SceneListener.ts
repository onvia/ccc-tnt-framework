import { _decorator } from "cc";

const { ccclass } = _decorator;



@ccclass('SceneListener')
export class SceneListener implements ISceneListener {

    private constructor() {

    }

    /** 进入场景，过渡动画开始 */
    onEnterTransitionStart?(sceneName: string) {
        console.log(`LoadingScene-> 进入场景，过渡动画开始  ${sceneName || "LoadingScene"}`);

    }
    /** 进入场景，过渡动画将要结束 */
    onEnterTransitionWillFinished?(sceneName: string) {
        console.log(`LoadingScene-> 进入场景，过渡动画将要结束  ${sceneName || "LoadingScene"}`);

    }
    /** 进入场景，过渡动画结束 */
    onEnterTransitionFinished?(sceneName: string) {
        console.log(`LoadingScene-> 进入场景，过渡动画结束  ${sceneName || "LoadingScene"}`);

    }


    /** 退出场景，过渡动画开始 */
    onExitTransitionStart?(sceneName: string) {
        console.log(`LoadingScene-> 退出场景，过渡动画开始  ${sceneName || "LoadingScene"}`);

    }
    /** 退出场景，过渡动画将要结束 */
    onExitTransitionWillFinished?(sceneName: string) {
        console.log(`LoadingScene-> 退出场景，过渡动画将要结束  ${sceneName || "LoadingScene"}`);

    }
    /** 退出场景，过渡动画结束 */
    onExitTransitionFinished?(sceneName: string) {
        console.log(`LoadingScene-> 退出场景，过渡动画结束  ${sceneName || "LoadingScene"}`);

    }

    private static _instance: SceneListener = null
    public static getInstance(): SceneListener {
        if (!this._instance) {
            this._instance = new SceneListener();
        }
        return this._instance;
    }
}
