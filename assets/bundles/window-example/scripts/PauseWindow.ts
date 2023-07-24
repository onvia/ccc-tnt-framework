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
        console.log(`PauseWindow-> onCreate`);
        
        this.setTopMenuBar({ color: Color.BLUE });
    }
    protected onLoad(): void {
        console.log(`PauseWindow-> onLoad`);
        
    }

    onStart(): void {
        console.log(`PauseWindow-> onStart`);
        
        this.registerButtonClick("btnClose", () => {
            this.close();
        })

        let labelFrom = this.findComponent("labelFrom", Label);
        labelFrom && (labelFrom.string = `暂停背景音：${this.options?.pauseBgm}`);
    }


}
