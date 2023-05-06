import { _decorator } from "cc";
import { UIEmbedItem } from "./embeds/UIEmbedItem";
import { UIEmbedPanel1 } from "./embeds/UIEmbedPanel1";
import { UIEmbedPanel2 } from "./embeds/UIEmbedPanel2";
import { UIEmbedPanel3 } from "./embeds/UIEmbedPanel3";
const { ccclass } = _decorator;
let { prefabUrl } = tnt._decorator;


@prefabUrl("window-example#prefabs/EmbedWindow")
@ccclass('EmbedWindow')
export class EmbedWindow extends tnt.UIWindowBase {


    onStart(): void {
        this.setClickAnyWhereClose();
        this.registeButtonClick("btnClose", () => this.close());

        // 面板 0
        this.addPanel("container0", "UIEmbedPanel1", "01");
        this.addPanel("container0", UIEmbedPanel2, "02");
        this.addPanel("container0", UIEmbedPanel3, "03");
        // 显示
        this.showPanel("01");


        // 面板 1
        this.addPanel("container1", UIEmbedPanel1, "11");
        this.addPanel("container1", UIEmbedPanel2, "12");
        this.addPanel("container1", UIEmbedPanel3, "13");
        // 显示
        this.showPanel("11");



        // 添加角标预制体
        this.addUIWithCtor(UIEmbedItem,"itemRoot");
        // 或者
        // this.addUI("UIEmbedItem","itemRoot");


        this.registeButtonClick('btnTab01', () => {
            this.showPanel("01");
        })

        this.registeButtonClick('btnTab02', () => {
            this.showPanel("02");
        })

        this.registeButtonClick('btnTab03', () => {
            this.showPanel("03");
        })

        this.registeButtonClick('btnTab11', () => {
            this.showPanel("11");
        })

        this.registeButtonClick('btnTab12', () => {
            this.showPanel("12");
        })

        this.registeButtonClick('btnTab13', () => {
            this.showPanel("13");
        })
    }


    protected onDestroy(): void {
        tnt.resourcesMgr.releaseLoader(this.uuid);
    }
}
