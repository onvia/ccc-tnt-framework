
import { _decorator, Pool } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass } = _decorator;


declare global {

    interface ITNT {
        NetRequest: typeof NetRequest;
    }

    namespace tnt {
        type NetRequest = InstanceType<typeof NetRequest>;
    }
}

const DEF_TIMEOUT = 15000;
@ccclass('NetRequest')
class NetRequest {
    sn: number = 0;
    msgKey: INetMsgKeyType = null;
    socket: ISocketProxy = null;
    isValid = false;
    sendTime: number = 0;
    timeout: number = DEF_TIMEOUT;
    abortKey: INetMsgKeyType = null;
    isAborted: boolean = false;

    onAbort?: () => void = null;
    onRecv?: (res: any) => void = null;
    onError?: (errCode: string | number, err: any) => void = null;
    onReturn?: () => void;
    onFree?: () => void;

    static alloc(netNode: ISocketProxy, sn: number) {
        let netRequest: NetRequest = pool.alloc();
        netRequest.socket = netNode;
        netRequest.isValid = true;
        netRequest.isAborted = false;
        netRequest.onAbort = null;
        netRequest.onRecv = null;
        netRequest.onError = null;
        netRequest.onFree = null;
        netRequest.onReturn = null;
        netRequest.sn = sn;
        return netRequest;
    }

    abort() {
        this.isAborted = true;
        this.onAbort?.();
    }
    /** 释放 */
    free() {
        if (!this.isValid) {
            return;
        }
        this.onFree?.();
        this.timeout = DEF_TIMEOUT;
        this.sendTime = 0;
        this.abortKey = null;
        this.isAborted = true;
        this.msgKey = null;
        this.isValid && pool.free(this);
        this.isValid = false;
    }

}

// 放在最后 防止 NetRequest 为 undefined
let pool: Pool<NetRequest> = EDITOR ? null : new Pool(() => {
    return new NetRequest();
}, 32);


tnt.NetRequest = NetRequest;

export { };