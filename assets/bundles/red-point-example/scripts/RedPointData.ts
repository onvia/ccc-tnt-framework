
import { _decorator, Component, Node, math } from 'cc';
const { ccclass, property } = _decorator;

interface UserInfo {
    gold: number;
}

interface MailInfo {
    msg: string;
    id: number;
    name: string;
}

interface MapData {
    sys: MailInfo[];
    friend: MailInfo[];
    zonemgn: MailInfo[];
}

interface Knight {
    uid: number; // 唯一id
    id: number; // 武将 id
    name: string;
    isNew: boolean;
}
interface IAlchemy {
    herbCount: number; // 草药数量
    stoveFrag: number; // 炉子碎片
    paperFrag: number; // 丹方碎片

}
declare global {

    interface IGame {
        redPointData: RedPointData;
    }
}

let knightUid = 0;

@ccclass('RedPointData')
export class RedPointData {

    userInfo: UserInfo = {
        gold: 0
    }
    mailData: MapData = {
        sys: [],
        friend: [],
        zonemgn: []
    }

    knights: Knight[] = [];

    alchemy: IAlchemy = {
        herbCount: 0,
        stoveFrag: 0,
        paperFrag: 0
    };
    chatMsgCount = 0;

    init() {
        this.userInfo.gold = math.randomRangeInt(10, 50);
        this.randomMailData();
        this.randomAlchemy();
        tnt.timerMgr.startTimer(()=>{
            this.chatMsgCount ++;
            // 刷新红点
            // 测试同一帧多次调用刷新
            tnt.redPointMgr.refreshRedPoint(10030, false);
            tnt.redPointMgr.refreshRedPoint(10030, true);
            tnt.redPointMgr.refreshRedPoint(10030, true);
        },this,2);
    }

    randomMailData() {
        let randomCount = () => {
            if (math.random() > 0.5) {
                return 0;
            }
            return math.randomRangeInt(0, 50);
        }

        for (const key in this.mailData) {
            const data = this.mailData[key] as MailInfo[];
            data.length = 0;
            let count = randomCount();
            for (let i = 0; i < count; i++) {
                data.push({
                    name: key + "名字" + i,
                    id: i,
                    msg: key + "msg",
                });
            }
        }

        // 更新整个 邮件系统的红点
        tnt.redPointMgr.refreshRedPoint(10010, true);
    }

    randomKnight() {
        let count = math.randomRangeInt(0, 50);

        for (let i = 0; i < count; i++) {
            let id = math.randomRangeInt(0, 50);
            let knight: Knight = {
                uid: ++knightUid,
                id: id,
                name: 'knigth_' + id,
                isNew: true
            }
            this.knights.push(knight);
        }

        tnt.redPointMgr.refreshRedPoint(10022, true);
    }

    randomAlchemy() {
        this.alchemy.herbCount = math.randomRangeInt(0, 50);
        this.alchemy.paperFrag = math.randomRangeInt(0, 50);
        this.alchemy.stoveFrag = math.randomRangeInt(0, 50);
    }



    simulationUpdateMail(channel: number, value: number) {

    }
    simulationUpdateChat(channel: number, value: number) {

    }
    simulationUpdateBag(itemId: number, value: number) {

    }

    simulationUpdateTask(taskId: number, value: number) {

    }

    // 判断是否能炼丹
    getAlchemyCount() {
        // 炼丹 2 草药一次
        return Math.floor(this.alchemy.herbCount / 2);
    }
    // 模拟炼丹
    simulationAlchemy() {
        if (this.getAlchemyCount() <= 0) {
            return;
        }
        this.alchemy.herbCount -= 2;
        tnt.redPointMgr.refreshRedPoint(10061);
        // 免费炼丹
        // 升级炼丹炉
        // 升级丹方
        // 免费升级丹方
        // 合成丹方

    }

    getLevelDanluCount() {
        // 升级炼丹炉 4 个碎片一次
        return Math.floor(this.alchemy.stoveFrag / 4);
    }
    // 升级丹炉
    simulationLevelDanlu() {
        if (this.getLevelDanluCount() <= 0) {
            return;
        }
        this.alchemy.stoveFrag -= 4;
        tnt.redPointMgr.refreshRedPoint(10062);
    }

    // 升级丹方的次数
    getLevelupDanfangCount() {
        return Math.floor(this.userInfo.gold / 5);
    }
    // 升级丹方
    simulationLevelupDanfang() {
        if (this.getLevelupDanfangCount() <= 0) {
            return;
        }
        // this.alchemy.paperFrag -= 4;
        this.userInfo.gold -= 5;
        console.time('refresh');

        // tnt.redPointMgr.refreshRedPoint(10063,true);
        tnt.redPointMgr.refreshRedPoint(10064);
        console.timeEnd('refresh');
    }
    // 合成丹方的次数
    getCompoundDanfangCount() {
        return Math.floor(this.alchemy.paperFrag / 4);
    }

    // 合成丹方
    simulationCompoundupDanfang() {
        if (this.getCompoundDanfangCount() <= 0) {
            return;
        }
        this.alchemy.paperFrag -= 4;
        // tnt.redPointMgr.refreshRedPoint(10063,true);
        tnt.redPointMgr.refreshRedPoint(10065);
    }

    getBagItemRedPointState(itemId: number) {

        return false;
    }


    private static _instance: RedPointData = null
    public static getInstance(): RedPointData {
        if (!this._instance) {
            this._instance = new RedPointData();
        }
        return this._instance;
    }
}

export const redPointData = RedPointData.getInstance();

tnt.game.redPointData = redPointData;