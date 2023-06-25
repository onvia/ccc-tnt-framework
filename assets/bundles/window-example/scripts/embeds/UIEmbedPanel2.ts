import { _decorator } from "cc";
const { ccclass } = _decorator;
let { prefabUrl } = tnt._decorator;


 
@prefabUrl("window-example#prefabs/panels/UIEmbedPanel2")
@ccclass('UIEmbedPanel2')
export class UIEmbedPanel2 extends tnt.UIPanel {

    protected onLoad(): void {
        console.log(`UIEmbedPanel2-> onLoad`);
        
    }
    protected onDestroy(): void {
        console.log(`UIEmbedPanel2-> onDestroy`);
        
    }
}
