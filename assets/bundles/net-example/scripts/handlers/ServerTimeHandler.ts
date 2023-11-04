
import { _decorator } from 'cc';
import { NetMsgErrorID } from '../network/NetMsgErrorID';
const { ccclass, property } = _decorator;
const { handler, recv } = tnt._decorator._net;
const SYNC_INTERVAL = 5 * 60 * 1000;

@handler()
@ccclass('ServerTimeHandler')
export class ServerTimeHandler implements cs.SyncTimeHandler {

    private _nextSyncTimer: ReturnType<typeof setTimeout> = null;

    enableSyncTime() {
        this._syncTime();
    }

    private _syncTime() {
        tnt.netMgr.send("SyncTime", {});
    }

    // 断开连接
    disconnected() {
        if (this._nextSyncTimer) {
            clearTimeout(this._nextSyncTimer);
        }
        console.log(`ServerTimeHandler-> 停止同步时间`);
    }

    sendSyncTime(data: cs.C2S_SyncTime): cs.C2S_SyncTime {
        return null;
    }

    @recv("SyncTime")
    recvSyncTime(data: cs.S2C_SyncTime) {
        if (data.ret != NetMsgErrorID.RET_OK) {
            return;
        }
        console.log(`ServerTimeHandler-> `, data.serverTime);

        this._nextSyncTimer = setTimeout(() => {
            this._syncTime();
        }, SYNC_INTERVAL);
    }

    private static _instance: ServerTimeHandler = null
    public static getInstance(): ServerTimeHandler {
        if (!this._instance) {
            this._instance = new ServerTimeHandler();
        }
        return this._instance;
    }
}

export const serverTimeHandler = ServerTimeHandler.getInstance();