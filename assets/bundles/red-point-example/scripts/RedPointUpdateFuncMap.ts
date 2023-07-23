
import { redPointData } from "./RedPointData";

type RedPointUpdateAble1<Options = any> = (id: number, options?: Options) => number;
type RedPointUpdateAble2<Options = any> = (parent: number, id: number, options?: Options) => number;

const RedPointUpdateFuncMap: Record<number, RedPointUpdateAble1 | RedPointUpdateAble2> = {
    [0]: function (parent, id, options) {
        // 武将背包
        if (parent === 10022) {
            // id
        }
        return 0;
    },
    [10011]: function (id, options) {
        // 系统邮件
        return redPointData.mailData.sys.length;
    },
    [10012]: function (id, options) {
        // 好友邮件
        return redPointData.mailData.friend.length;
    },
    [10013]: function (id, options) {
        // 宗门邮件
        return redPointData.mailData.zonemgn.length;
    },

    [10022]: function (id, options) {
        // 英雄背包
        return 0;
    },
    [10030]: function(id,options){
        
        return redPointData.chatMsgCount;
    },
    [10061]: function (id, options) {
        // 炼丹 2 草药一次
        return redPointData.getAlchemyCount();
    },
    [10062]: function (id, options) {
        // 升级炼丹炉 4 个碎片一次
        return redPointData.getLevelDanluCount()
    },
    [10064]: function (id, options) {
        // 升级丹方
        // 4 张丹方碎片 和 5个金币升级一次
        return redPointData.getLevelupDanfangCount();
    },
    [10065]: function (id, options) {
        // 合成丹方
        // 4 张丹方碎片
        return redPointData.getCompoundDanfangCount();
    },

}

export class RedPointRequestUpdate implements IRedPointRequestUpdate {
    requestUpdate<Options = any>(parent: number, id: number, options?: Options): number {
        let func1 = RedPointUpdateFuncMap[id] as RedPointUpdateAble1;
        if (func1) {
            return func1(id, options)
        }
        let func2 = RedPointUpdateFuncMap[0] as RedPointUpdateAble2;
        return func2(parent, id, options);
    }

}