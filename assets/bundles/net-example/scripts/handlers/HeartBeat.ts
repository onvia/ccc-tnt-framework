
import { _decorator, Component, Node } from 'cc';
import { MsgID } from '../network/MsgID';
const { ccclass, property } = _decorator;


@ccclass('HeartBeat')
export class HeartBeat implements INetHeartBeat {

    interval: number = 180000;
    timeout: number = 15000;

    heartbeat() {
        tnt.netMgr.send('HeartBeat', {});
    }
    check(data: any): boolean {
        return data.s2cId === MsgID.ID_S2C_HeartBeat;
    }

    onHeartbeatAnswer?(data: any) {
        console.log(`HeartBeat-> 心跳`);
    }

    onDisconnected() {

    }
}
