import { AssetManager, _decorator } from "cc";
import "./AnimationType";

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

    declare animationType: tnt.AnimationType;

    // 当前动画名字
    declare animationName: string;

    declare fullPath;


    abstract play(name: string, loop?: boolean, timescale?: number);
    abstract playOnce(name: string, listener?: Runnable, timescale?: number);

    abstract stop(name?: string);

    abstract stopAll();

    public setCompleteListener(listener) {

    }


    /**
     * 加载资源
     * @param fullPath 
     */
    abstract loadResource(loaderKey: string, fullPath: string, bundle?: AssetManager.Bundle): Promise<AnimationBase>;

    /**
     * 获取当前正在播放的动画名称
     */
    abstract getCurrentAnimation(): string;
    // update (dt) {}
}
tnt.AnimationBase = AnimationBase;
export { };