
declare global {
    interface ITNT {
        serverTime: ServerTime;
    }
}

class ServerTime {

    private _zone: number; // 时区
    private _diff: number; // 客户端时区比服务器时区快了多少秒
    private _serverTime: number;  // 最后一次得到的服务器时间
    private _lastSyncStartTime: number; // 最后一次同步开始时本地时间
    private _lastSyncEndTime: number; // 最后一次同步的时候的时间

    constructor() {

        this._zone = 8; // 默认服务器时区,北京时区
        this._diff = 0; // 客户端时区比服务器时区快了多少秒
        this._serverTime = this.getLocalTime(); // 时间戳  本地时间
        this._lastSyncEndTime = this.getLocalTime(); // 最后一次 setTime 时, 本地时间点
        this._lastSyncStartTime = this.getLocalTime();
    }

    getLocalTime() {
        let data = new Date().getTime();
        return data;
    }

    getTimezone() {
        let offset = (new Date()).getTimezoneOffset() * 60;
        return -offset;
    }

    /**
     * 开始同步服务器时间
     */
    syncServerTimeStart() {
        this._lastSyncStartTime = this.getLocalTime();
    }

    /** 同步服务器时间
     * @param time 服务器时间
     * @param zone 时区
     */
    syncServerTime(time: number, zone: number) {

        this._serverTime = time;
        this._zone = zone;
        this._lastSyncEndTime = this.getLocalTime();
        this._diff = this.getTimezone() - zone * 3600;
    }

    getServerTime() {
        let elapsed = this.getLocalTime() - this._lastSyncEndTime;
        let time = Math.floor((this._serverTime + elapsed) / 1000);

        // let elapsed1 = this._serverTime - this._lastSyncStartTime;
        // let time1 = this.getLocalTime() + elapsed1;

        return time;
    }

    getServerDate(value?: number | string | Date) {
        let t: number = 0;
        if (typeof value === 'string') {
            t = new Date(value).getTime()
        } else if (typeof value === 'object' && value instanceof Date) {
            t = value.getTime()
        } else {
            t = this.getLocalTime();
        }

        let localDate = new Date((t - this._diff) * 1000);
        return localDate;
    }
    private static _instance: ServerTime = null
    public static getInstance(): ServerTime {
        if (!this._instance) {
            this._instance = new ServerTime();
        }
        return this._instance;
    }
}

tnt.serverTime = ServerTime.getInstance();

export { };