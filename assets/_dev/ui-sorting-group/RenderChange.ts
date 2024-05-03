import { _decorator, Node, UIRenderer, MaskComponent, Component, sys } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('RenderChange')
@menu("性能优化/RenderChange")
export class RenderChange extends Component {
    onLoad() {
    }


    protected onDisable(): void {
        if (!sys.isNative) {
            // @ts-ignorec
            this.node[`__enableLevelRender`] = false;
        } else {
            // @ts-ignorec
            if (this.node.setEnableLevelRender) {
                // @ts-ignorec
                this.node.setEnableLevelRender(false);
            }
        }
    }

    protected onEnable(): void {

        if (!sys.isNative) {
            // @ts-ignorec
            this.node[`__enableLevelRender`] = true;
        } else {
            // @ts-ignorec
            if (this.node.setEnableLevelRender) {
                // @ts-ignorec
                this.node.setEnableLevelRender(true);
            }
        }
    }
}