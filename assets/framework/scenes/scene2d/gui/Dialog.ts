
import { _decorator, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
const { prefabUrl } = tnt._decorator;



declare global {
    interface DialogOptions {
        text: string;
        showCancel?: boolean;
        cancelText?: string;
        confirmText?: string;
        clickConfirm: Runnable;
        clickCancel?: Runnable;
    }
}

@prefabUrl("framework#resources/dialog/Dialog")
@ccclass('Dialog')
export class Dialog extends tnt.UIPopup<DialogOptions> {
    
    protected onStart(): void {

        let text = this.getLabelByName("text");
        let btnConfirm = this.find('btnConfirm');
        let btnCancel = this.find('btnCancel');

        if (!this.options.showCancel) {
            btnCancel.active = false;
            btnConfirm.position = new Vec3(0, btnConfirm.position.y, btnConfirm.position.z)
        }
        
        this.registeButtonClick(btnConfirm, () => {
            this.options.clickConfirm?.();
            this.close();
        });
        this.registeButtonClick(btnCancel, () => {
            this.options.clickCancel?.();
            this.close();
        });

        text.string = this.options.text;
        let cancelText = this.getLabelByName("Label", btnCancel);
        let confirmText = this.getLabelByName("Label", btnConfirm);
        this.options.cancelText && (cancelText.string = this.options.cancelText);
        this.options.confirmText && (confirmText.string = this.options.confirmText);
    }

}
