import * as ws from 'ws';
import { eventMgr } from '../framework/EventMgr';

declare global {
    type SDecodeData = { cpid: number,spid: number, uid: number, body: any };
    type Fn = (msgId: number, msg: SDecodeData, ws: ws.WebSocket) => void;
}

export class Service {

    bindMsg(msgId: number, fn: Fn, target?: any) {
        eventMgr.on(msgId as any, fn, target || this);
    }
    onInit() {

    }

    onDestroy() {

    }

    send(ws: ws.WebSocket, msgId: number, msg: any,cpid: number) {
        msg.spid = msgId;
        msg.cpid = cpid
        ws.send(JSON.stringify(msg), (err) => {
            if (err) {
                console.log(`[SERVER] error: ${err}`);
            }
        });
    }

}