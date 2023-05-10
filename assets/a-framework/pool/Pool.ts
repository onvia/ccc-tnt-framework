
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



declare global {
    interface IPoolOptions<T> {
        maxCount?: number;
        newObject(): T;
        reset?(object: T): boolean;
    }


    interface ITNT {
        Pool: typeof Pool;
    }

    namespace tnt {
        type Pool<T> = InstanceType<typeof Pool<T>>;
    }
}
@ccclass('Pool')
class Pool<T> {
    public declare maxCount: number;
    protected _pool: Array<T> = [];
    protected declare options: IPoolOptions<T>;
    constructor(options: IPoolOptions<T>) {
        options && this.initialize(options);
    }

    get count() {
        return this._pool.length;
    }

    initialize(options: IPoolOptions<T>) {
        this.maxCount = options.maxCount || 64;
        this.options = options;
    }

    get() {
        if (this._pool.length == 0) {
            return this.options.newObject?.();
        }
        return this._pool.pop();
    }

    put(object: T) {
        if (!object) {
            console.log(`Pool->put 对象不能为 null`);
            return false;
        }

        let reset = this.options.reset ? this.options.reset(object) : true;
        if (reset && this._pool.length < this.options.maxCount) {
            this._pool.push(object);
            return true;
        }
        return false;
    }

    putAll(objects: T[]) {
        if (!objects) {
            console.log(`Pool->putAll 对象不能为 null`);
            return;
        }
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            this.put(object);
        }
    }

    clear() {
        this._pool.length = 0;
    }

    /**
     * 丢弃多余的节点
     * @param length 
     */
    resize(length: number) {
        if (length >= 0) {
            this._pool.length = length;
        }
    }

    size() {
        return this._pool.length;
    }

    forEach(callbackfn: (value: T, index: number, array: T[]) => void) {
        this._pool.forEach(callbackfn);
    }

    all(): T[] {
        return this._pool;
    }
}
tnt.Pool = Pool;
export { };