
import { _decorator, ISchedulable, director, Scheduler } from 'cc';
import { DEBUG, DEV } from 'cc/env';
import { Counter } from './Counter';
import DefaultWebSocketImpl from './impl/DefaultWebSocketImpl';
import { __net } from './Net';
const { mgr } = __net;
const { ccclass } = _decorator;

// 断线重连
// https://www.gameres.com/686645.html



declare global {

    interface ITNT {
        NetMgr: typeof NetMgr;
    }

    namespace tnt {
        type NetMgr = InstanceType<typeof NetMgr>;
    }
}

enum SocketStatus {
    Opening = 1,
    Opened = 2,
    Closing = 3,
    Closed = 4,
}

enum CloseCode {
    NORMAL = 1000,
    FORCE = 3000,
    CONNECT_ERROR = 3001,
    MSG_ERROR = 3002,
    RECONNECT_ONCE = 3003, // 重连一次失败
    RECONNECT_MAX_COUNT = 3004, // 重连次数超次
    HEART_TIMEOUT = 3005, // 心跳超时

    UNKNOWN_ERROR = 3100, // 未知错误
}

type ConnectResult = { isSuccess: boolean, errCode?: number, errMsg?: string };
type ConnectCallback = (result: ConnectResult) => void;


const REQUEST_TIMEOUT = 10000;
const DEFAULT_HEART_TIMEOUT = 15000;
const MAX_RETRY_COUNT = 3;
const RECONNECT_TIMEOUT = 3000;

@mgr()
@ccclass('NetMgr')
class NetMgr extends tnt.EventMgr<ProtoType> {

    //#region ---------- 装饰器自动注入 ----------

    private declare handlerArray: GConstructor[];
    private declare sendFnMap: Map<INetMsgKeyType, INetSRObject>;
    private declare recvFnMap: Map<INetMsgKeyType, INetSRObject>;

    //#endregion ---------- 装饰器自动注入 ----------

    // Handler 对象
    private _handlerObjectMap: Map<string, any> = new Map();

    public readonly CloseCode = CloseCode;

    private options: Readonly<INetMgrOptions> = null;


    // 当前连接状态
    protected _status: SocketStatus = SocketStatus.Closed;
    public get status(): SocketStatus {
        return this._status;
    }

    public get isConnected(): boolean {
        return this._status === SocketStatus.Opened;
    }

    protected _ws: ISocketProxy = null;
    private _codec: INetCodec = null;
    private _heartbeat: INetHeartBeat = null;
    private _listener: INetListener = null;


    protected _snCounter = new Counter(1);

    get lastSN() {
        return this._snCounter.last;
    }

    get nextSN() {
        return this._snCounter.getNext(true);
    }

    private _protocols: any = null;

    // 进行中的请求
    protected _pendingRequests: tnt.NetRequest[] = [];
    get pendingRequests(): Readonly<tnt.NetRequest[]> {
        return this._pendingRequests;
    }
    protected _connecting: { onReturn: ConnectCallback };

    public initialize(options: INetMgrOptions, ws?: ISocketProxy) {
        this._ws = ws || new DefaultWebSocketImpl();
        this.options = options;
        this._listener = options.netListener;
        // this.protoKeyTransformer = options.keyTransformer;
        this._codec = options.codec;
        this._heartbeat = options.heartbeat;

        this._ws.options = {
            onConnected: this._onConnected.bind(this),
            onClose: this._onClose.bind(this),
            onError: this._onError.bind(this),
            onMessage: this._onMessage.bind(this),
        }

        this._initHandlerObjects();
    }

    private _initHandlerObjects() {
        if (!this.handlerArray) {
            return;
        }
        for (let i = 0; i < this.handlerArray.length; i++) {
            const clazz = this.handlerArray[i];
            // @ts-ignore
            this._handlerObjectMap.set(clazz.__net_tag_id__, new clazz());
        }
    }


    public connect()
    public connect(protocols: string | string[])
    public connect(callback: ConnectCallback)
    public connect(protocols: string | string[], callback: ConnectCallback)
    public connect(protocols?: string | string[] | ConnectCallback, callback?: ConnectCallback) {
        if (this.isConnected || this._status == SocketStatus.Opening) {
            return;
        }
        console.log(`NetMgr-> 开始连接`);

        if (typeof protocols === 'function') {
            callback = protocols;
            protocols = null;
        }
        this._protocols = protocols ?? this._protocols;
        this._connecting = {
            onReturn: callback
        };
        this._ws.connect(this.options.serverUrl, this._protocols as string | string[]);
        this._status = SocketStatus.Opening;


        // 是否是重连
        let isReconnect = !!this._postConnectForReconnect;
        this._listener.onUpdateConnectState(true, isReconnect);
    }

    private _fnDisconnecting: () => void = null;
    /** 主动断开连接 */
    public disconnect(code?: number, reason?: string) {

        if (this._status === SocketStatus.Closed) {
            return;
        }
        let isClosed = false;

        this._fnDisconnecting = () => {
            if (isClosed) {
                return;
            }
            isClosed = true;
        }
        this._close(code, reason);

        // N 秒之后还没有被关闭，则强制关闭
        setTimeout(() => {
            if (isClosed) {
                return;
            }
            isClosed = true;
            this._onClose(CloseCode.FORCE, '强制关闭连接');
        }, 1000);
    }

    public close(code?: number, reason?: string) {
        if (this._status === SocketStatus.Closed) {
            return;
        }
        this._status = SocketStatus.Closing;

        this._close(code, reason);
    }
    private _close(code?: number, reason?: string) {
        try {
            this._ws.close(code ?? CloseCode.NORMAL, reason ?? '');
        }
        catch (e) {
            console.error('NetMgr-> [WsCloseError]', e);
        }
    }

    public send<T extends INetProtoKeyType>(key: T, req: ProtoTypeReq<T>)
    public send<T extends INetProtoKeyType>(key: T, req: ProtoTypeReq<T>, options: INetRequestOptions<T>)
    public send<T extends INetProtoKeyType>(key: T, req: ProtoTypeReq<T>, recv: INetRecv<T>)
    public send<T extends INetProtoKeyType>(key: T, req: ProtoTypeReq<T>, options?: INetRequestOptions<T> | INetRecv<T>) {
        if (!req) {
            req = {};
        }
        // 使用装饰器注入的类处理数据
        let requestData = this._preSendData(key as string, req);

        const sn = this._snCounter.getNext()
        let pendingRequest = tnt.NetRequest.alloc(this._ws, sn);

        this._pendingRequests.push(pendingRequest);

        let _options: INetRequestOptions<T> = options as INetRequestOptions<T>;
        if (typeof options == "function") {
            _options = {
                onRecv: options,
            }
        }
        if (!_options) {
            options = {};
        }


        pendingRequest.msgKey = key;
        // pendingRequest.c2sId = this.protoKeyTransformer.C2SKeyConvertToID(key);

        pendingRequest.onFree = () => {
            this._pendingRequests.removeOne(v => v.msgKey === pendingRequest.msgKey);
        }

        if (!requestData) {
            this.abort(pendingRequest.sn);
            return;
        }

        // pendingRequest.requestData = requestData;
        pendingRequest.abortKey = _options.abortKey || key;
        pendingRequest.timeout = _options.timeout || this.options.requestTimeout || REQUEST_TIMEOUT;
        pendingRequest.onAbort = _options.onAbort;
        pendingRequest.onRecv = _options.onRecv;
        pendingRequest.onError = _options.onError;

        // 对数据进行编码
        let preEncodeRes = this._codec.encode({ data: requestData, key: pendingRequest.msgKey, sn: pendingRequest.sn });
        if (!preEncodeRes || !this.isConnected) {
            this.abort(pendingRequest.sn);
            return;
        }
        pendingRequest.sendTime = new Date().getTime()
        this._setupRequestTimeoutEvent(pendingRequest, pendingRequest.timeout);


        DEBUG && console.log(`NetMgr-> [send] ${key}: ${pendingRequest.sendTime} `, req);

        let code = this.sendData(preEncodeRes.data);
        if (code == 1) {
            // 通知监控器请求
            this._listener?.onRequest(pendingRequest);
        }
    }

    /** 直接发送数据，不进行任何处理 */
    public sendData(data: any) {
        if (!this.isConnected) {
            // 可以缓存非连接状态的请求
            return -1;
        }
        this._ws.send(data as any);
        return 1;
    }

    /** 设置请求超时事件 */
    private _setupRequestTimeoutEvent(pendingRequest: tnt.NetRequest, timeout?: number) {
        // Timeout
        let timer: ReturnType<typeof setTimeout> = null;

        if (timeout) {
            timer = setTimeout(() => {
                timer = null;
                // 请求超时
                this._listener?.onRequestTimeout(pendingRequest);
                // 移除请求
                this._listener?.onResponse(pendingRequest, {
                    isSuccess: false,
                    res: null,
                    err: "请求超时: " + pendingRequest.msgKey
                });
                pendingRequest.free();
                // 超时
            }, timeout);
        }

        // 在 _onMessage 调用
        pendingRequest.onReturn = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }
    }

    // 中断请求
    public abort(sn: number): void {
        let index = this._pendingRequests.findIndex(v => v.sn === sn);
        if (index === -1) {
            return;
        }

        let pendingRequest = this._pendingRequests[index];
        pendingRequest.isAborted = true;

        DEBUG && console.log(`NetMgr-> [Abort] ${pendingRequest.msgKey}: ${pendingRequest.sendTime}`);


        // 清理超时事件
        pendingRequest.onReturn?.();
        pendingRequest.onAbort?.();

        // 移除请求
        this._listener?.onResponse(pendingRequest, {
            isSuccess: false,
            res: null,
            err: "中断请求 " + pendingRequest.msgKey
        });

        pendingRequest.free(); // 调用 free 时会将 pendingRequest 从 _pendingRequests 中移除
    }

    private _onConnected(event: any) {
        if (!this._connecting) {
            return;
        }

        console.log(`NetMgr-> 连接成功`);

        let pack = this._listener.onConnected({ errCode: 0, isSuccess: true });

        if (!pack.isSuccess) {
            // socket 直接断开连接
            this.close(pack.errCode || CloseCode.CONNECT_ERROR);
            return;
        }
        this._status = SocketStatus.Opened;
        this._connecting?.onReturn?.({
            isSuccess: true
        });
        this._connecting = null;

        // 是否是重连
        let isReconnect = !!this._postConnectForReconnect;
        // 重连
        if (isReconnect) {
            this._postConnectForReconnect();
            this._postConnectForReconnect = null;
        }

        this._listener.onUpdateConnectState(false, isReconnect);
        // 开启心跳
        this._doHeartbeat();
    }

    private _onMessage(data: any) {
        if (this._status !== SocketStatus.Opened) {
            return;
        }

        // 解码数据
        this._codec.decode(data, (preDecodeRes: INetDecode) => {

            if (!preDecodeRes) {
                console.log(`NetMgr-> 回包数据解码错误 错误码 ${preDecodeRes.errCode}`);
                return;
            }
            if (this._heartbeat?.check(preDecodeRes)) {
                this._onHeartbeatAnswer(preDecodeRes);
                return;
            }

            let pendingRequest = this._pendingRequests.find(v => v.msgKey === preDecodeRes.key);
            if (pendingRequest) {
                // 接收到数据，清理超时事件
                pendingRequest?.onReturn?.();

                // // 保存解码后的数据
                // pendingRequest.respondData = preDecodeRes.data as any;
                // 响应
                this._listener?.onResponse(pendingRequest, {
                    isSuccess: true,
                    res: preDecodeRes.data,
                    err: null,
                });
            }

            DEBUG && console.log(`NetMgr-> [recv] ${preDecodeRes.key}: ${Date.now()} `, preDecodeRes.data);

            // 
            if (!preDecodeRes.isSuccess) {
                console.log(`NetMgr-> Recv Error `, preDecodeRes);
                pendingRequest?.onError?.(preDecodeRes.errCode, "解码错误");
                pendingRequest?.free();
                return;
            }

            // 发送给 handler 类
            this._preRecvData(preDecodeRes.key, preDecodeRes.data);
            // 先通知到外面，可能会调整数据
            this.emit(preDecodeRes.key as any, preDecodeRes.data);
            // 最后给到回调
            pendingRequest?.onRecv?.(preDecodeRes.data);
            pendingRequest?.free();

        });
    }

    private _onError(e: unknown) {
        DEV && console.error('NetMgr-> [WebSocket Error]', e);
        // 连接中，返回连接失败
        if (this._connecting) {
            let errMsg = `Failed to connect to WebSocket server: ${this.options.serverUrl}`;
            this._connecting.onReturn?.({ isSuccess: false, errCode: 0, errMsg });
            this._connecting = null;
            console.error(errMsg);
        }

        this._listener.onError(e);
    }
    private _onClose(code: number, reason: string) {
        // 防止重复执行
        if (this._status === SocketStatus.Closed) {
            return;
        }

        console.log(`NetMgr-> WebSocket closed code: ${code}, reason: ${reason}`);

        let isManual = !!this._fnDisconnecting;
        let isConnectedBefore = this.isConnected || isManual;

        this._status = SocketStatus.Closed;


        // 连接中，返回连接失败
        if (this._connecting) {
            let errMsg = `连接到服务器: ${this.options.serverUrl} 失败`
            this._connecting.onReturn?.({ isSuccess: false, errCode: -1, errMsg });
            this._connecting = null;
            console.error(errMsg);
        }

        // 清理心跳包
        this._clearHeartbeat();

        // 主动关闭连接
        if (this._fnDisconnecting) {
            this._fnDisconnecting()
            this._fnDisconnecting = null;
        }
        // 非 disconnect 中，从连接中意外断开
        else if (isConnectedBefore) {
            console.log(`NetMgr-> 从 ${this.options.serverUrl} 失去连接`, `code=${code} reason=${reason}`);
        }

        // 释放所有正在进行的请求 
        this._pendingRequests.slice().forEach(v => {
            v.onReturn?.(); // 清理超时事件
            v.onError?.(code, reason); // 对事件报错
            v.free(); // 从请求列表删除
        })


        this._listener.onDisconnect({
            code,
            reason,
            isConnectedBefore,
            isManual
        });
    }



    // 中断请求
    public abortByKey(abortKey: string) {
        this._pendingRequests.filter(v => v.abortKey === abortKey).forEach(v => { this.abort(v.sn) });
    }

    // 注入的方法处理 发送的数据
    private _preSendData(key: string, req: any) {
        if (!this.sendFnMap) {
            return req;
        }
        let srObj = this.sendFnMap.get(key);
        if (srObj) {
            let handlerObject = this._handlerObjectMap.get(srObj.targetTag);
            if (handlerObject) {
                return handlerObject[srObj.sendFnName](req);
            }
            DEV && console.error(`NetMgr-> preSendData  没有注册 ${srObj.targetTag} 类`);
            return req;
        }

        DEV && console.warn(`NetMgr-> preSendData  没有注册 ${key} 协议`);

        return req;
    }
    // 注入的方法处理回包数据
    private _preRecvData(key: INetMsgKeyType, response: any): any {
        if (!this.recvFnMap) {
            return response;
        }
        let recvObj = this.recvFnMap.get(key);
        if (recvObj) {
            let handlerObject = this._handlerObjectMap.get(recvObj.targetTag);
            if (handlerObject) {
                return handlerObject[recvObj.recvFnName](response);
            }
            DEV && console.error(`NetMgr-> preRecvData  没有注册 ${recvObj.targetTag} 类`);
            return response;
        }
        DEV && console.warn(`NetMgr-> preRecvData  没有注册 ${key} 协议`);
    }

    public on<T extends Keyof_ProtoType>(key: T, listener?: (res: ProtoTypeRes<T>) => void, target?: object, priority?: number, ...args: any): void {
        super.on(key, listener, target, priority, ...args);
    }

    public off<T extends Keyof_ProtoType>(key: T, listener?: (res: ProtoTypeRes<T>) => void, target?: object): void {
        super.off(key, listener, target);
    }


    //#region  ------------------------------  心跳  ------------------------------
    private _pendingHeartbeat: { startTime: number, timeoutTimer: ReturnType<typeof setTimeout> } = null;
    private _nextHeartbeatTimer: ReturnType<typeof setTimeout> = null;
    lastHeartbeatLatency: number = null;

    private _doHeartbeat() {
        // 没有设置心跳包
        if (!this._heartbeat) {
            console.error(`NetMgr-> 没有设置心跳包`);
            return;
        }
        this._pendingHeartbeat = {
            startTime: Date.now(),
            timeoutTimer: setTimeout(() => {
                this._pendingHeartbeat = null;

                console.error('NetMgr-> 心跳超时，自动断开连接');
                if (this._status === SocketStatus.Opened) {
                    this._close(CloseCode.HEART_TIMEOUT, 'Heartbeat timeout');
                    // this._onClose(CloseCode.HEART_TIMEOUT, 'Heartbeat timeout');
                }
            }, this._heartbeat?.timeout || DEFAULT_HEART_TIMEOUT)
        };

        DEBUG && console.log(`NetMgr-> [Heartbeat] Send  timestamp: `, this._pendingHeartbeat.startTime);
        this._heartbeat?.heartbeat();
    }

    private _onHeartbeatAnswer(data: any) {
        if (!this._pendingHeartbeat || this._status !== SocketStatus.Opened || !this._heartbeat) {
            return;
        }

        this._heartbeat.onHeartbeatAnswer?.(data);
        // heartbeat success
        this.lastHeartbeatLatency = Date.now() - this._pendingHeartbeat.startTime;
        DEBUG && console.log(`[Heartbeat] Recv , 延迟 ${this.lastHeartbeatLatency}ms. `, data)
        clearTimeout(this._pendingHeartbeat.timeoutTimer);
        this._pendingHeartbeat = null;

        // next heartbeat timer
        this._nextHeartbeatTimer = setTimeout(() => {
            this._doHeartbeat();
        }, this._heartbeat.interval)
    }

    private _clearHeartbeat() {
        if (this._pendingHeartbeat) {
            clearTimeout(this._pendingHeartbeat.timeoutTimer);
            this._pendingHeartbeat = null;
        }
        if (this._nextHeartbeatTimer) {
            clearTimeout(this._nextHeartbeatTimer);
        }
        this._heartbeat?.onDisconnected();
    }

    //#endregion ------------------------------  心跳  ------------------------------


    //#region  ------------------------------  重连  ------------------------------

    // 最大重连次数
    private _retryCount = 0;
    public get retryCount() {
        return this._retryCount;
    }
    private _nextRetryTimer: ReturnType<typeof setTimeout> = null;
    private _postConnectForReconnect: () => void = null;
    // 重连
    public reconnect(callback?: ConnectCallback) {
        let maxReconnectCount = this.options.maxReconnectCount || MAX_RETRY_COUNT;
        if (maxReconnectCount <= 0) {
            console.log(`NetMgr-> 未设置自动重连`);
            return;
        }
        this._postConnectForReconnect = () => {
            console.log(`NetMgr-> 连接成功，清理状态`);
            this.clearRetryState();
        };
        this._tryReconnect(callback);
    }

    private _tryReconnect(callback?: ConnectCallback) {
        let reconnectTimeout = this.options.reconnectTimeout || RECONNECT_TIMEOUT;
        let maxReconnectCount = this.options.maxReconnectCount || MAX_RETRY_COUNT;
        if (maxReconnectCount <= 0) {
            console.log(`NetMgr-> 未设置自动重连`);
            return;
        }
        this._retryCount++;
        console.log(`NetMgr-> 第 ${this._retryCount} 次重连`);

        this.connect(this._protocols, callback);
        this._nextRetryTimer = setTimeout(() => {
            if (this._retryCount < maxReconnectCount) {
                this.close(CloseCode.RECONNECT_ONCE);
                this._tryReconnect(callback);
            } else {
                // 重连失败，清理状态，返回主界面
                this.clearRetryState();
                console.log(`NetMgr-> 重连失败`);
                this.close(CloseCode.RECONNECT_MAX_COUNT);
            }
        }, reconnectTimeout);
    }

    private clearRetryState() {
        if (this._nextRetryTimer) {
            clearTimeout(this._nextRetryTimer);
        }
        this._retryCount = 0;
        this._postConnectForReconnect = null;
    }
    //#endregion  ------------------------------  重连  ------------------------------

    private static _instance: NetMgr = null;
    public static getInstance(): NetMgr {
        if (!this._instance) {
            this._instance = new NetMgr();
        }
        return this._instance;
    }

}



declare global {
    interface ITNT {
        netMgr: NetMgr;
    }
}

tnt.netMgr = NetMgr.getInstance();
tnt.NetMgr = NetMgr;

export { };