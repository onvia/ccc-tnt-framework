import { _decorator, Node, ProgressBar, Label } from "cc";
import { GUIBase } from "./GUIBase";

const { ccclass } = _decorator;
const { prefabUrl, node, label, button, progressBar } = tnt._decorator;


declare global {
    interface GUIProgressBarOptions extends GUIBaseOptions {
        updateProgressFn: Runnable;
        updateLabelFn: Runnable;
    }
}

@prefabUrl("cc-gui#prefabs/GUIProgressBar")
@ccclass('GUIProgressBar')
export class GUIProgressBar extends GUIBase<GUIProgressBarOptions> {

    @progressBar("ProgressBar")
    progressBar: ProgressBar = null;

    @label()
    label: Label = null;

    protected onStart(): void {
        super.onStart();

        this.onSizeChanged();
        this.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
    }

    protected update(dt: number): void {
        this.progressBar.progress = this.options.updateProgressFn();

        this.label && (this.label.string = this.options.updateLabelFn());
    }

    onSizeChanged() {
        this.scheduleOnce(() => {
            let bar = this.progressBar.barSprite;
            this.progressBar.totalLength = this.progressBar.node.uiTransform.width - bar.node.widget.left * 2;
        });
    }
}
