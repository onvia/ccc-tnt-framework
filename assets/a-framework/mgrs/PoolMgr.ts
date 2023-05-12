import { error, instantiate, Node, Prefab, Sprite, SpriteFrame, Texture2D, _decorator } from "cc";
import { DEBUG } from "cc/env";
const { ccclass } = _decorator;



declare global {
    interface ITNT {
        poolMgr: PoolMgr;
    }

    interface ITNT {
        PoolMgr: typeof PoolMgr;
    }

    namespace tnt {
        type PoolMgr = InstanceType<typeof PoolMgr>;
    }

}

interface iPoolOptions<T> {
    maxCount?: number;
    newObject?(): T;
    reset?(object: T): boolean;
}



@ccclass('PoolMgr')
class PoolMgr {

    constructor(readonly name: string) {
    }

    public get LOADER_KEY() {
        return `PoolMgr_${this.name}`
    };

    protected _loader: tnt.AssetLoader = null;
    public get loader() {
        if (!this._loader) {
            this._loader = tnt.loaderMgr.get(this.LOADER_KEY);
        }
        return this._loader;
    }

    protected poolMap: Map<string, tnt.NodePool | tnt.Pool<any>> = new Map();
    protected templeteMap: Map<string, Node | any> = new Map();
    protected poolResMap: Map<string, { path: string, bundle?: string, type?: CCAssetType }> = new Map();

    protected _currentNodePool: tnt.NodePool = null;
    protected _currentNodePoolName: string = null;


    public createPool<T>(name: string, node: any, options?: iPoolOptions<T>) {
        if (this.has(name)) {
            return this.getPool(name);
        }
        if (!node) {
            return null;
        }

        let pool = null;
        if (node instanceof Node || node instanceof Prefab) {
            let _pool = new tnt.NodePool(options as any);
            pool = _pool;
        } else {
            let _pool = new tnt.Pool<T>(options as any);
            pool = _pool;
        }

        this.poolMap.set(name, pool);
        this.templeteMap.set(name, node);

        return pool;
    }

    /** 使用图片资源地址创建 池 */
    public createPoolWithAssetPath(poolName: string, res: { path: string, bundle?: string, type?: CCAssetType }, options?: iPoolOptions<Node>, callback?: (poolName: string) => void) {
        return new Promise<any>((resolve, reject) => {
            if (this.has(poolName)) {
                callback?.(poolName);
                resolve(this.getPool(poolName));
                return;
            }

            poolMgr.loader.load(res.path, res.type, (err, asset) => {
                if (err) {
                    error(err);
                    return;
                }
                let prefab: Prefab = null;
                if (asset instanceof SpriteFrame || asset instanceof Texture2D) {
                    prefab = poolMgr.createPrefabWithImageAsset(asset);
                } else if (asset instanceof Prefab) {
                    prefab = asset;
                }
                let pool = poolMgr.createPool(poolName, prefab, options);
                this.poolResMap.set(poolName, res);
                callback?.(poolName);
                resolve(pool);
            }, res.bundle);
        })
    }

    /**
     * 从指定池中获取元素
     *
     * @param {string} poolName
     * @return {*} 
     * @memberof PoolMgr
     */
    public get(poolName: string) {
        if (!poolName) {
            return null;
        }
        let pool = this._pool(poolName);
        if (!pool) {
            return null;
        }

        let node = null;

        if (DEBUG) {
            console.log(`PoolMgr-> get: ${poolName} size: ${pool.count}`);
        }

        // if(pool.count > 0){
        //     node = pool.get();
        // }else{
        //     let param = this.templeteMap.get(name);
        //     node = instantiate(param);
        // }
        node = pool.get();
        if (!node) {
            let param = this.templeteMap.get(poolName);
            node = instantiate(param);
        }
        return node;

    }

    /**
     * 回收元素
     *
     * @param {string} poolName
     * @param {*} element
     * @return {*} 
     * @memberof PoolMgr
     */
    public put(poolName: string, element: any) {

        if (!poolName) {
            console.error(`PoolMgr-> put: name is null}`);
            return false;
        }
        if (!element) {

            return false;
        }
        let pool = this._pool(poolName);
        if (!pool) {
            return false;
        }

        pool.put(element);

        if (DEBUG) {
            console.log(`PoolMgr-> put: ${poolName} size: ${pool.count}`);
        }

        return true;
    }

    public putAll(name: string, arr: Array<any>) {
        while (arr.length > 0) {
            let element = arr[0];
            arr.splice(0, 1);
            this.put(name, element);
        }
    }

    /**
     * 判断是否有指定池
     *
     * @param {string} name
     * @return {*}  {boolean}
     * @memberof PoolMgr
     */
    public has(name: string): boolean {
        return this.poolMap.has(name);
    }

    public size(name: string) {
        let pool = this.poolMap.get(name);
        if (!pool) {
            return -1;
        }
        return pool.count;
    }


    public getPool(name: string) {
        return this.poolMap.get(name);
    }



    private _pool(name: string): tnt.Pool<any> {
        let pool = null;
        if (name == this._currentNodePoolName) {
            pool = this._currentNodePool;
        } else {
            pool = this.poolMap.get(name);
            if (!pool) {
                DEBUG && console.warn(`PoolMgr-> not have  [${name}] pool`);
                return null;
            }
            this._currentNodePool = pool;
            this._currentNodePoolName = name;
        }
        return pool;
    }


    /**
     * 用资源创建预制体
     *
     * @param {(SpriteFrame | Texture2D)} asset
     * @return {*} 
     * @memberof PoolMgr
     */
    public createPrefabWithImageAsset(asset: SpriteFrame | Texture2D) {
        let node = new Node();
        let sprite = node.addComponent(Sprite);
        if (asset instanceof Texture2D) {
            sprite.spriteFrame.texture = asset;
        } else if (asset instanceof SpriteFrame) {
            sprite.spriteFrame = asset;
        }
        return this.createPrefabByNode(node);
    }

    /** 
     * 手动实现一个预制体
    */
    createPrefabByNode(node: Node) {
        let prefab = new Prefab();
        prefab.data = node;

        // 解决警告信息，不加这段也可以
        const prefabInfo = new Prefab._utils.PrefabInfo();
        prefabInfo.asset = prefab;
        prefabInfo.root = prefab.data;
        prefab.data._prefab = prefabInfo;

        // Prefab._utils.PrefabInfo
        // node["_prefab"] = prefab;        // 解决警告信息，不加这句也可以
        prefab.optimizationPolicy = Prefab.OptimizationPolicy.AUTO;

        ////  如果支持 JIT 才进行编译
        //@ts-ignore
        if (CC_SUPPORT_JIT) {
            prefab.compileCreateFunction();
        }
        return prefab;
    }


    /**
     * 删除指定池
     *
     * @param {string} poolName
     * @param {boolean} [releaseAsset=true] 是否释放资源
     * @memberof PoolMgr
     */
    public deletePool(poolName: string,releaseAsset = true) {
        if (this.poolMap.has(poolName)) {
            let pool = this.poolMap.get(poolName);
            if (pool instanceof tnt.NodePool) {
                pool.clear();
            } else {
                pool.resize(0);
            }
            this.poolMap.delete(poolName);
        }

        if (this.templeteMap.has(poolName)) {
            let node = this.templeteMap.get(poolName);
            if (node instanceof Node || node instanceof Prefab) {
                node.destroy();
            }
            this.templeteMap.delete(poolName)
        }

        if(releaseAsset){
            if (this.poolResMap.has(poolName)) {
                let poolRes = this.poolResMap.get(poolName);
                this.loader.releaseAsset(poolRes.path, poolRes.type, poolRes.bundle);
                this.poolResMap.delete(poolName);
            }
        }
    }

    public clear() {
        this.poolMap.forEach((pool) => {
            if (pool instanceof tnt.NodePool) {
                pool.clear();
            } else {
                pool.resize(0);
            }
        });
        this.poolMap.clear();
        this.templeteMap.forEach((node) => {
            if (node instanceof Node || node instanceof Prefab) {
                node.destroy();
            }
        });
        this.templeteMap.clear();
        this.poolResMap.clear();
        tnt.loaderMgr.releaseLoader(this.loader); // 一次性释放所有资源
        this._currentNodePoolName = null;
        this._currentNodePool = null;
        this._loader = null;
    }



    private static _instance: PoolMgr = null
    public static getInstance(): PoolMgr {
        if (!this._instance) {
            this._instance = new PoolMgr("Share");
        }
        return this._instance;
    }
}

const poolMgr = PoolMgr.getInstance();
tnt.PoolMgr = PoolMgr;
tnt.poolMgr = poolMgr;

export { };