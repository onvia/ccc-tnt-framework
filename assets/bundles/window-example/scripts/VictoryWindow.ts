import { _decorator, Color } from "cc";

const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;



declare global {
    interface VictoryWindowOptions {
        awards: any[];
    }
}

@prefabUrl("window-example#prefabs/VictoryWindow")
@ccclass('VictoryWindow')
export class VictoryWindow extends tnt.UIPopup {


    public onCreate(): void {

        this.setHideOtherWindows(true);
    }

    onStart(): void {
        console.log(`VictoryWindow-> onInit`);
        this.registerButtonClick("btnClose", () => {
            this.close();
        });
    }

    // update (deltaTime: number) {
    // }
}
