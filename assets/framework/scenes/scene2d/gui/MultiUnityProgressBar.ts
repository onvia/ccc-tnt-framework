
import { Node, Component, Prefab, _decorator, instantiate, ProgressBar } from "cc";
const { ccclass, executeInEditMode } = _decorator;

/**
 * 多个进度条合一的进度条
 * 
 */
interface MultiUnityProgressBarOptions {
    count: number;
    progress: number;
    prefabUrl: string;
    bundle?: string;
}

@ccclass('MultiUnityProgressBar')
@executeInEditMode
export class MultiUnityProgressBar extends Component {

    private _template: Prefab = null;

    private _count = 5;

    public get count() {
        return this._count;
    }
    public set count(value) {
        if (this._count != value) {
            this._count = Math.round(value);
            this.updateCount();
        }
    }

    private _progress = 1;
    public get progress() {
        return this._progress;
    }
    public set progress(value) {
        if (this._progress != value) {
            this._progress = value;
            this.updateProgress();
        }
    }

    private _bars: ProgressBar[] = [];

    private _options: MultiUnityProgressBarOptions = null;

    static createWithPanel(panel: Node, options: MultiUnityProgressBarOptions) {
        let progressBar = panel.getComponent(MultiUnityProgressBar);
        if (!progressBar) {
            progressBar = panel.addComponent(MultiUnityProgressBar);
        }
        progressBar.onCtor(panel, options);
        return progressBar;
    }

    onCtor(panel: Node, options: MultiUnityProgressBarOptions) {
        this._options = options;
        this.node = panel;
        tnt.resourcesMgr.load(this.uuid, options.prefabUrl, Prefab, (err, prefab) => {
            this._template = prefab;
            this.updateCount();

            this.count = this._options.count;
            this.progress = this._options.progress;
        }, this._options.bundle);
    }
    onLoad() {
        this.updateCount();
    }

    start() {

    }

    updateCount() {
        this.node.destroyAllChildren();
        this._bars.length = 0;
        if (this._template && this.count > 0) {
            for (let i = 0; i < this.count; i++) {
                let bar = instantiate(this._template);
                bar.parent = this.node;
                bar.name = `bar${i + 1}`;
                let progressBar = bar.getComponent(ProgressBar);
                if (!progressBar) {
                    console.log(`MultiUnityProgressBar-> 子进度条不存在  ProgressBar  组件`);
                }
                this._bars.push(progressBar);
            }
        }
    }

    updateProgress() {
        let value = this.count * this.progress;
        for (let i = 0; i < this._bars.length; i++) {
            let bar = this._bars[i];
            if (!bar) {
                continue;
            }
            if (value > 0) {
                if (value >= 1) {
                    bar.progress = 1;
                } else {
                    bar.progress = value;
                }
            } else {
                bar.progress = 0;
            }
            value--;
        }
    }

    protected onDestroy(): void {

        tnt.resourcesMgr.releaseLoader(this.uuid);
    }
}
