import * as cc from "cc";
const { ccclass } = cc._decorator;
let { prefabUrl } = tnt._decorator;


 
@prefabUrl("window-example#prefabs/panels/UIEmbedPanel1")
@ccclass('UIEmbedPanel1')
export class UIEmbedPanel1 extends tnt.UIPanel {

    
    protected onLoad(): void {
        console.log(`UIEmbedPanel1-> onLoad`);
        
    }
    protected onDestroy(): void {
        console.log(`UIEmbedPanel1-> onDestroy`);
        
    }
}
