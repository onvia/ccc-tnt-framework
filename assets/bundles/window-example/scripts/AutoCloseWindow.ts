import { Label, tween, _decorator } from "cc";


const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;



@prefabUrl("window-example#prefabs/AutoCloseWindow")
@ccclass('AutoCloseWindow')
export class AutoCloseWindow extends tnt.UIPopup {


    onActive(): void {
        console.log(`AutoCloseWindow-> onActive`);
    }
    onFreeze(): void {
        console.log(`AutoCloseWindow-> onFreeze`);
    }

    protected onStart(): void {

        let label = this.findComponent("labelUUID", Label);
        label.string = this.uuid;

        this.setClickAnyWhereClose(false);
    }
    onShowCallback() {
        let duration = 3;
        console.log(`AutoCloseWindow-> onShowCallback`);
        
        this.setUniqueness(false);
        this.setAutoClose(duration);
        
        this.registerButtonClick("btnClose", () => {
            this.close();
        })

        this.setClickAnyWhereClose(true);

        tnt.timerMgr.startTimer(()=>{
            this.setLabelText("labelTimer", `${--duration}秒后自动关闭`);
        },this,1,duration - 1);
    }
    onCloseCallback() {
        console.log(`AutoCloseWindow-> onCloseCallback`);
    }
}
