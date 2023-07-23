
import { _decorator, Node, sys } from 'cc';
import { DEBUG } from 'cc/env';
const { ccclass } = _decorator;



declare global {
    interface ITNT {
        storageMgr: StorageMgr;
    }

    interface IStorageEncode {
        encode(value: string): string;
        decode(value: string): string;
    }
}

@ccclass('StorageMgr')
class StorageMgr {
    encoder: IStorageEncode = null;
    prefix: string = "";

    setPrefix(val: string) {
        this.prefix = val;
    }
    saveWithPrefix(key: string, value: any) {
        if (!this.prefix) {
            DEBUG && console.warn(`StorageMgr-> 本地存储前缀不存在`);
        }
        this.save(this.prefix + ":" + key, value);
    }
    loadWithPrefix(key: string, _default?: any) {
        if (!this.prefix) {
            DEBUG && console.warn(`StorageMgr-> 本地存储前缀不存在`);
        }
        return this.load(this.prefix + ":" + key, _default);
    }
    save(key: string, value: any) {
        let str = null;
        if (typeof value === "string") {
            str = value;
        } else {
            str = JSON.stringify(value);
        }
        if (this.encoder) {
            str = this.encoder.encode(str);
        }
        sys.localStorage.setItem(key, str);
    }

    load(key: string, _default?: any) {
        let str = sys.localStorage.getItem(key);

        if (this.encoder) {
            str = this.encoder.decode(str);
        }

        if (typeof _default == 'string') {
            return str;
        }
        if (str) {
            return JSON.parse(str);
        }
        return null;
    }


    remove(key: string) {
        sys.localStorage.removeItem(key);
    }

    private static _instance: StorageMgr = null
    public static getInstance(): StorageMgr {
        if (!this._instance) {
            this._instance = new StorageMgr();
        }
        return this._instance;
    }
}
tnt.storageMgr = StorageMgr.getInstance();
export { };