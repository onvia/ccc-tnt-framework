
import { _decorator, Component, Node } from 'cc';
import { serverTimeHandler } from '../handlers/ServerTimeHandler';
const { ccclass, property } = _decorator;


@ccclass('NetListener')
export class NetListener implements INetListener {



    declare tipTimer: ReturnType<typeof setTimeout>;

    requestMap: Map<INetMsgKeyType, Array<tnt.NetRequest>> = new Map();

    onUpdateConnectState(isConnecting: boolean, isReconnect: boolean) {
        if (isConnecting) {
            if (isReconnect) {
                // 显示 重连提示
            } else {
                // 显示 连接提示
            }
        } else {
            // 隐藏所有连接状态 UI
        }
    }
    onRequest(netRequest: Readonly<tnt.NetRequest>) {
        // 判断id是否需要跳过
        // if(true){
        //   return;
        // }
        let arr = this.requestMap.get(netRequest.msgKey) ?? [];
        arr.push(netRequest);
        this.requestMap.set(netRequest.msgKey, arr);

        if (!this.tipTimer) {
            this.tipTimer = setTimeout(() => {
                // 转菊花
            }, 2000);
        }
    }
    onResponse(netRequest: Readonly<tnt.NetRequest>, ret: INetReturn) {
        let msgKey = netRequest.msgKey;
        let arr = this.requestMap.get(msgKey);
        if (arr?.length) {
            arr.pop();
            if (!arr?.length) {
                this.requestMap.delete(msgKey);
            }
        }
        if (!this.requestMap.size) {
            this.clearTipTimer();
            // 隐藏菊花
        }
    }
    onRequestTimeout(netRequest: Readonly<tnt.NetRequest>) {
        // 弹出超时提示和面板


    }

    onConnected(pack: INetConnected) {
        // 连接成功后做一些处理
        return pack;
    }

    onError(err: any) {

    }

    onDisconnect(pack: Readonly<INetDisconnect>): void {

        this.clearTipTimer();
        this.requestMap.clear();
        if (pack.isConnectedBefore && !pack.isManual) {
            // 网络出现问题

        } else {
            if (pack.code === tnt.netMgr.CloseCode.MSG_ERROR) {
                // 被踢下线// 跳转场景

            }
        }


        serverTimeHandler.disconnected();
        if (!pack.isManual) { //非主动下线
            // 
            // 自动重连
            tnt.netMgr.reconnect((res) => {
                if (res.isSuccess) {
                    console.log(`NetListener-> 连接  这里是重新连接`);
                    serverTimeHandler.enableSyncTime();
                }
            });
        }

    }

    clearTipTimer() {
        clearTimeout(this.tipTimer);
        this.tipTimer = null;
    }
}
