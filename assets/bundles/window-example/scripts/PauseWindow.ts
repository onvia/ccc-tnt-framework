import { _decorator, Color, Label } from "cc";

const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;



declare global {
    interface PauseWindowOptions {
        pauseBgm: boolean;
    }
}


@prefabUrl("window-example#prefabs/PauseWindow")
@ccclass('PauseWindow')
export class PauseWindow extends tnt.UIWindow<PauseWindowOptions> {


    public onCreate(): void {

        this.setTopMenuBar({ color: Color.BLUE });
    }

    onStart(): void {
        this.registeButtonClick("btnClose", () => {
            this.close();
        })

        let labelFrom = this.findComponent("labelFrom", Label);
        labelFrom && (labelFrom.string = `暂停背景音：${this.options?.pauseBgm}`);
    }


    onActive(): void {
        console.log(`PauseWindow-> onActive`);
    }
    onFreeze(): void {
        console.log(`PauseWindow-> onFreeze`);
    }

    onShowCallback() {
        console.log(`PauseWindow-> onShowCallback`);

    }
    onCloseCallback() {
        console.log(`PauseWindow-> onCloseCallback`);

    }
}
