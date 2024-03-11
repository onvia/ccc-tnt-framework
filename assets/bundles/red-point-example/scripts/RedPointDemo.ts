
import { _decorator, Component, Node, JsonAsset, director, Director } from 'cc';
import { RedPointCompProxy } from './RedPointCompProxy';
import { redPointData } from './RedPointData';
import { RedPointRequestUpdate } from './RedPointUpdateFuncMap';
const { ccclass, property } = _decorator;


@ccclass('RedPointDemo')
export class RedPointDemo extends tnt.SceneBase {

    
    onEnterTransitionStart(sceneName?: string): void {

        redPointData.init();
        tnt.redPointMgr.setRedPointRequestUpdate(new RedPointRequestUpdate());

        this.loader.load("red-point-example#data/red_point_info", JsonAsset, (err, jsonAsset) => {
            tnt.tblMgr.init([jsonAsset]);
            this.onInit();
        });

    }

    onEnter(): void {
        this.registerButtonClick("btnMail", () => {
            tnt.uiMgr.showWindow("MailPopup");
        });
        this.registerButtonClick("btnAlchemy", () => {
            tnt.uiMgr.showWindow("AlchemyPopup");
        });

        let LayoutRandom = this.getNodeByName("LayoutRandom");
        this.registerButtonClick("btnMailRandom", () => {
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


        // 红点优先级
        let _10011 = tnt.redPointMgr.getRedPoint(10011);
        let _10012 = tnt.redPointMgr.getRedPoint(10012);
        let _10013 = tnt.redPointMgr.getRedPoint(10013);
               
        _10012.priority = -1;
        _10013.priority = -2;
        _10011.priority = 1;
        
    }

    onExit(): void {
        tnt.redPointMgr.clear();
    }

}