import { AssetManager, _decorator } from "cc";
import { AnimationType } from "./AnimationType";

const { ccclass, property } = _decorator;

declare global {

    interface ITNT {
        AnimationBase: typeof AnimationBase;
    }

    namespace tnt {
        type AnimationBase = InstanceType<typeof AnimationBase>;
    }
}

@ccclass
abstract class AnimationBase extends tnt.GComponent {

    declare animationType: AnimationType;

    // 当前动画名字
    declare animationName: string;

    declare fullpath;


    abstract play(name: string, loop?: boolean, timescale?: number);
    abstract playOnce(name: string, listener?: Runnable, timescale?: number);

    abstract stop(name?: string);

    abstract stopAll();

    public setCompleteListener(listener) {

    }


    /**
     * 加载资源
     * @param fullpath 
     */
    abstract loadResource(loaderKey: string, fullpath: string, bundle?: AssetManager.Bundle): Promise<AnimationBase>;

    /**
     * 获取当前正在播放的动画名称
     */
    abstract getCurrentAnimation(): string;
    // update (dt) {}
}
tnt.AnimationBase = AnimationBase;
export { };