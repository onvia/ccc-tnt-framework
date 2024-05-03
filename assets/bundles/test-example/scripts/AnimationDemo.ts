import { _decorator, Animation, AnimationState, Node, ProgressBar, Slider } from "cc";

const { ccclass } = _decorator;
const { node, sprite, button, slider } = tnt._decorator;


declare global {
    interface AnimationDemoOptions {

    }
}

@ccclass('AnimationDemo')
export class AnimationDemo extends tnt.SceneBase<AnimationDemoOptions> {


    animation: Animation;

    @slider("Slider")
    slider: Slider;
    state: AnimationState;

    onEnter(): void {
        this.animation = this.getComponent(Animation);
        this.state = this.animation.getState("animation");
    }

    onExit(): void {

    }

    protected update(dt: number): void {

        this.state.setTime(this.slider.progress * this.state.duration);
        this.state.update(dt);
    }
}
