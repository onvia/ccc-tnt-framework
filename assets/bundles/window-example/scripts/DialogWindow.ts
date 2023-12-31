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


    public onCreate(): void {
        console.log(`DialogWindow-> onCreate`);
        
    }
    protected onLoad(): void {
        console.log(`DialogWindow-> onLoad`);
        
    }
    onStart(): void {
        super.onStart();
        console.log(`DialogWindow-> onStart`);
        this.setUniqueness(false);
        this.setClickAnyWhereClose();

        this.setLabelText("labelCustom", this.options.text)
        this.registerButtonClick("btnClose", () => this.close());
    }

    

}
