import { _decorator, Node, Slider, misc, clamp01, EditBox } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, editBox, slider } = tnt._decorator;


declare global {
    interface GUISliderOptions extends GUIBaseOptions {
        defaultValue?: number;
        minValue?: number;
        maxValue?: number;
        callback?: Runnable2<number, number>;
    }
}

@prefabUrl("cc-gui#prefabs/GUISlider")
@ccclass('GUISlider')
export class GUISlider extends GUIBase<GUISliderOptions> {


    @node("background")
    background: Node = null;

    @node("disable")
    disable: Node = null;

    //@sprite("node-name")
    //sprite: Sprite = null;

    @slider("Slider")
    slider: Slider = null;

    @editBox("EditBox")
    editBox: EditBox = null;

    protected onStart(): void {
        super.onStart();

        this.options.maxValue = this.options.maxValue || 1;
        this.options.minValue = this.options.minValue || 0;
        this.options.defaultValue = this.options.defaultValue || 1;

        this.registerEditBoxDidEnd(this.editBox, this.onEditDidEnded);
        this.registerSliderEvent(this.slider, this.onSliderCallback);

        this.scheduleOnce(() => {
            // let nameWidth = this.nameLabel.node.uiTransform.width;
            // let nameLeft = this.nameLabel.node.widget.left;
            let width = 0;
            for (let i = 0; i < this.node.children.length; i++) {
                const child = this.node.children[i];
                if (child == this.slider.node || child === this.background || child === this.disable) {
                    continue;
                }
                width += child.uiTransform.width;
            }

            this.slider.node.uiTransform.width = Math.min(120, this.node.uiTransform.width - width);
            this.scheduleOnce(() => {
                this.setProgress(clamp01((this.options.defaultValue - this.options.minValue) / (this.options.maxValue - this.options.minValue)));
            });
        });

        this.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
    }


    setProgress(progress: number) {
        let value = clamp01(progress);
        this.slider.progress = value;
        this.editBox.string = "" + (this.options.minValue + value * (this.options.maxValue - this.options.minValue)).toFixed(2);
    }

    setValue(value: number) {
        let progress = clamp01((value - this.options.minValue) / (this.options.maxValue - this.options.minValue));
        this.slider.progress = progress;
        this.options.callback?.(progress, value);
    }

    updateValue(value: any, progress?: any, arg3?: any, arg4?: any) {
        if (typeof value != 'undefined') {
            this.setValue(value);
        }
        if (typeof progress != "undefined") {
            this.setProgress(progress);
        }
    }

    onSliderCallback(slider: Slider) {
        const progress = slider.progress;
        let value = (this.options.minValue + progress * (this.options.maxValue - this.options.minValue)).toFixed(2);
        this.editBox.string = "" + value;
        this.options.callback && this.options.callback(progress, Number(value));
    }

    onEditDidEnded(editBox: EditBox) {
        const value = Number(editBox.string);
        this.setValue(value);
    }

    onSizeChanged() {
        this.scheduleOnce(() => {
            this.slider["_updateHandlePosition"]()
        });
    }
}
