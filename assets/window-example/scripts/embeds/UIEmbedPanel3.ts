import * as cc from "cc";
const { ccclass } = cc._decorator;
let { prefabUrl } = tnt._decorator;


 
@prefabUrl("window-example#prefabs/panels/UIEmbedPanel3")
@ccclass('UIEmbedPanel3')
export class UIEmbedPanel3 extends tnt.UIPanel {

    protected onLoad(): void {
        console.log(`UIEmbedPanel3-> onLoad`);
        
    }
    protected onDestroy(): void {
        console.log(`UIEmbedPanel3-> onDestroy`);
        
    }
}
