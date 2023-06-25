import { _decorator } from "cc";

const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;


declare global {
    interface DialogWindowOptions {
        text: string;
    }
}

@prefabUrl("window-example#prefabs/DialogWindow")
@ccclass('DialogWindow')
export class DialogWindow extends tnt.UIPopup<DialogWindowOptions> {


    onStart(): void {
        super.onStart();
        console.log(`DialogWindow-> onInit`);
        this.setUniqueness(false);
        this.setClickAnyWhereClose();

        this.setLabelText("labelCustom", this.options.text)
    }

    onActive(): void {
        console.log(`DialogWindow-> onActive`);
    }
    onFreeze(): void {
        console.log(`DialogWindow-> onFreeze`);
    }

    onShowCallback() {
        this.registeButtonClick("btnClose", () => {
            this.close();
        })
    }
    onCloseCallback() {
        console.log(`DialogWindow-> onCloseCallback`);
    }

}
