
import { _decorator, Component, Node, JsonAsset, director, Director } from 'cc';
import { RedPointCompProxy } from './RedPointCompProxy';
import { redPointData } from './RedPointData';
import { RedPointRequestUpdate } from './RedPointUpdateFuncMap';
const { ccclass, property } = _decorator;


@ccclass('RedPointDemo')
export class RedPointDemo extends tnt.SceneBase {

    onEnterTransitionStart(sceneName?: string): void {

        redPointData.init();
        tnt.redPointMgr.setRedPountRequestUpdate(new RedPointRequestUpdate());

        this.loader.load("red-point-example#data/red_point_info", JsonAsset, (err, jsonAsset) => {
            tnt.tblMgr.init([jsonAsset]);
            this.onInit();
        });

    }

    onEnter(): void {
        this.registeButtonClick("btnMail", () => {
            tnt.uiMgr.showWindow("MailPopup");
        });
        this.registeButtonClick("btnAlchemy", () => {
            tnt.uiMgr.showWindow("AlchemyPopup");
        });

        let LayoutRandom = this.getNodeByName("LayoutRandom");
        this.registeButtonClick("btnMailRandom", () => {
            tnt.game.redPointData.randomMailData();
        }, this, LayoutRandom);
    }

    onInit() {



        let map = {
            [10010]: "btnMail",
            [10020]: "btnBag",
            [10030]: "btnChat",
            [10040]: "btnTask",
            [10050]: "btnActivity",
            [10060]: "btnAlchemy",
        }
        let redPointMgr = tnt.redPointMgr;
        redPointMgr.initWithData(tnt.tbl.red_point_info.getDataListReadonly() as tbl.red_point_info[], 10000);

        for (const key in map) {
            const element = map[key];
            let node = this.find(element);
            let redPointRoot = node.getChildByName("RedPoint");
            tnt.redPointMgr.setDisplayProxy(parseInt(key),redPointRoot, RedPointCompProxy);
        }
    }


}