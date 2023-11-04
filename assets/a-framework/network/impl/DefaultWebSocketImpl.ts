export default class DefaultWebSocketImpl implements ISocketProxy {

    _ws: WebSocket = null;
    options: ISocketOptions = null;

    connect(url: string | URL, protocols?: string | string[]) {
        let ws = new WebSocket(url, protocols);
        ws.binaryType = "arraybuffer";
        ws.onmessage = e => {
            if (e.data instanceof ArrayBuffer) {
                this.options.onMessage(new Uint8Array(e.data));
            }
            else if (typeof e.data === 'string') {
                this.options.onMessage(e.data);
            }
            else {
                console.warn('[Unresolved Recv]', e.data)
            }
        };
        ws.onopen = this.options.onConnected;
        ws.onerror = this.options.onError;
        ws.onclose = e => {
            this.options.onClose(e.code, e.reason);
            this._ws = undefined;
        };

        this._ws = ws;
    }

    state(): number {
        return this._ws?.readyState;
    }

    close(code?: number, reason?: string) {
        this._ws?.close(code, reason);
        this._ws = null;
    }

    send(buffer: INetData): number {
        if (this._ws?.readyState == WebSocket.OPEN) {
            this._ws?.send(buffer);
            return 1;
        }
        return -1;
    }

}