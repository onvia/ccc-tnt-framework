import { _decorator } from "cc";

const { ccclass } = _decorator;

interface _ITbl {
    keys: Array<string>;
    data: Array<Array<any>>;
    index: Record<string, number>;
    redirect: Record<string, any>;
}

@ccclass('Tbl')
export class Tbl<T> {
    cache: T[] = [];
    name: string;
    json: _ITbl;


    public init(name: string, data: any) {
        this.name = name;
        this.json = data;
    }

    public getLength() {
        return this.json.data.length;
    }

    public getDataByIndex(index: number) {
        return this.warpKeys(index);
    }

    public getIndex(...keys: string[] | number[]) {
        let key = keys.join("_");
        return this.json.index[key];
    }

    /**
     * 获取数据
     *
     * @param {(...string[] | number[])} keys
     * @return {*}  {T}
     * @memberof Tbl
     */
    public get(...keys: string[] | number[]): T {
        let key = keys.join("_");
        let data: T = this.warpKeys(this.json.index[key]);

        if (!data) {
            console.error("Tbl-> [" + this.name + "] 不存在 key = " + [...keys].toString())
        }

        return data;
    }

    private warpKeys(index: number): T {
        if (this.cache[index] != undefined) {
            return this.cache[index];
        } else {
            let data = this.json.data[index];
            if (data) {
                let redirectKeys: string[] = [];
                let obj: any = {};
                for (let i = 0; i < this.json.keys.length; i++) {
                    let key = this.json.keys[i];
                    obj[key] = data[i];
                    // 判断是否需要重定向
                    if (this._needRedirect(key)) {
                        redirectKeys.push(key);
                    }
                }
                this.cache[index] = obj;

                // 延迟进行重定向，防止死循环
                for (let j = 0; j < redirectKeys.length; j++) {
                    const key = redirectKeys[j];
                    obj[key] = this._redirect(key, obj[key]);
                }
                obj = Object.freeze(obj);
                return obj;
            }
        }
        return null as any;
    }

    private _needRedirect(key: string) {
        return key in this.json.redirect;
    }

    private _redirect(key: string, data: any) {
        if (key in this.json.redirect) {
            let tblName = this.json.redirect[key];
            let tbl = tnt.tbl[tblName];
            if (tbl) {
                let finalData = null;
                if (Array.isArray(data)) {
                    finalData = tbl.get.apply(tbl, data);
                } else {
                    finalData = tbl.get(data);
                }
                if (finalData) {
                    return finalData;
                }
            }
            return null;
        }
        return data;
    }
    /**
     * 获取数据数组 - 只读
     * @return { T[] } 
     * @memberof Tbl
     */
    public getDataListReadonly(): T[] {
        for (let i = 0; i < this.json.data.length; i++) {
            if (this.cache[i]) {
                continue;
            }
            this.warpKeys(i);
        }
        if (!Object.isFrozen(this.cache)) {
            Object.freeze(this.cache);
        }
        return this.cache;
    }

    /**
     * 获取数据副本
     * @return { T[] } 
     * @memberof Tbl
     */
    public getDataListCopy(): T[] {
        let data = this.getDataListReadonly();
        return JSON.parse(JSON.stringify(data));
    }

    /**
     *  过滤出指定数据
     * @param {(data: T)=> boolean} filterFn
     * @return { T[] } 
     * @memberof Tbl
     */
    public filter(filterFn: (data: T) => boolean): T[] {
        let list = [];
        let dataList = this.getDataListReadonly();
        for (let i = 0; i < dataList.length; i++) {
            const element = dataList[i];
            if (filterFn(element)) {
                list.push(element);
            }
        }
        return list;
    }
}

declare global {
    class GTbl<T> extends Tbl<T>{ }
}

export { };