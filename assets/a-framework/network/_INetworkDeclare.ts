


declare global {
    type INetData = (string | ArrayBufferLike | Blob | ArrayBufferView);

    type INetMsgKeyType = string | number;
    type INetProtoKeyType = INetMsgKeyType & Keyof_ProtoType;

    interface ISocketProxy {
        options: ISocketOptions;
        connect(url: string, protocols?: string | string[]);
        close(...args);
        send(buffer: INetData): number;
        state(): number;
    }

    interface ISocketOptions {
        onConnected?: (event: Event) => void;
        onClose?: (code: number, reason: string) => void;
        onError?: (event: Event) => void;
        onMessage?: (data: Uint8Array | string) => void;
    }
    interface INetRequestOptions<T extends INetProtoKeyType> {
        /**
         * Timeout of this request（ms）
         * `undefined` represents no timeout
         * @defaultValue `undefined`
         */
        timeout?: number;

        /**
         * ```ts
         * // Send API request many times
         * client.send('SendData', { data: 'AAA' }, { abortKey: 'Session#123' });
         * client.send('SendData', { data: 'BBB' }, { abortKey: 'Session#123' });
         * client.send('SendData', { data: 'CCC' }, { abortKey: 'Session#123' });
         * 
         * // And abort the at once
         * client.abortByKey('Session#123');
         * ```
         */
        abortKey?: string;

        onAbort?: () => void,
        onRecv?: INetRecv<T>,
        onError?: (errCode: string | number, err: any) => void;
    }


    interface INetRecv<T extends Keyof_ProtoType> {
        (res: ProtoTypeRes<T>)
    }


    // 心跳
    interface INetHeartBeat {

        /** 心跳间隔时间（毫秒）   */
        interval: number;
        /** 心跳超时时间（毫秒） ，超时可关闭连接 */
        timeout: number;

        /** 进行一次心跳 */
        heartbeat();
        /** 检查是否是心跳包 */
        check(data: any): boolean;
        /** 对心跳进行应答 */
        onHeartbeatAnswer?(data: any);
        /** 断开连接后清理心跳 */
        onDisconnected();
    }

    type INetConnected = { errCode?: number, isSuccess: boolean };
    type INetPreSend = { key: string, req: any, options: INetRequestOptions<any> };
    type INetEncode = { data: any, key: INetMsgKeyType, sn: number };
    type INetDecode = { data: any, key: INetMsgKeyType, errCode?: string | number, isSuccess: boolean, sn?: number };
    type INetReturn = { isSuccess: boolean, res?: any | undefined, err?: any | undefined };

    type INetDisconnect = {
        code?: number,
        reason?: string,
        isConnectedBefore: boolean;
        /** 是否是主动断开 */
        isManual?: boolean
    };

    /** 编码解码 */
    interface INetListener {
        onConnected(pack: INetConnected): INetConnected;
        onDisconnect(pack: Readonly<INetDisconnect>): void;
        /** 连接状态更新 */
        onUpdateConnectState(isConnecting: boolean, isReconnect: boolean);

        onError(err: any);

        onRequest(netRequest: Readonly<tnt.NetRequest>);
        onResponse(netRequest: Readonly<tnt.NetRequest>, ret: INetReturn);
        onRequestTimeout(netRequest: Readonly<tnt.NetRequest>);
        onDisconnect(state: Readonly<INetDisconnect>);
    }
    interface INetMgrOptions {

        serverUrl: string;

        // channel?: number;

        /** 最大重连次数，小于等于 0 时，不进行自动重连 */
        maxReconnectCount?: number;

        /** 请求超时时间 单位 毫秒 默认 15000 */
        requestTimeout?: number;

        /** 重连超时时间 */
        reconnectTimeout?: number;

        /** 网络监听 */
        netListener: INetListener;

        /** 编解码器 */
        codec: INetCodec;

        /** 心跳包 */
        heartbeat?: INetHeartBeat;

    }

    interface INetCodec {
        encode(pack: INetEncode): INetEncode;
        decode(data: INetData, callback: (pack: INetDecode) => void): void;
    }


}

export { };