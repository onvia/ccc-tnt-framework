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

    get LOADER_KEY() {
        return `PoolMgr_${this.name}`
    };

    protected _loader: tnt.AssetLoader = null;
    get loader() {
        if (!this._loader) {
            this._loader = tnt.loaderMgr.get(this.LOADER_KEY);
        }
        return this._loader;
    }

    protected nodePoolMap: Map<string, tnt.NodePool | tnt.Pool<any>> = new Map();
    protected templeteMap: Map<string, Node | any> = new Map();
    protected poolResMap: Map<string, { path: string, bundle?: string, type?: CCAssetType }> = new Map();

    protected _currentNodePool: tnt.NodePool = null;
    protected _currentNodePoolName: string = null;


    createPool<T>(name: string, node: any, options?: iPoolOptions<T>) {
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

        this.nodePoolMap.set(name, pool);
        this.templeteMap.set(name, node);

        return pool;
    }

    /** 使用图片资源地址创建预制体 */
    createPoolWithAssetPath(poolName: string, res: { path: string, bundle?: string, type?: CCAssetType }, options?: iPoolOptions<Node>, callback?: (poolName: string) => void) {
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

    get(name: string) {
        if (!name) {
            return null;
        }
        let pool = this._pool(name);
        if (!pool) {
            return null;
        }

        let node = null;

        if (DEBUG) {
            console.log(`PoolMgr-> get: ${name} size: ${pool.count}`);
        }

        // if(pool.count > 0){
        //     node = pool.get();
        // }else{
        //     let param = this.templeteMap.get(name);
        //     node = instantiate(param);
        // }
        node = pool.get();
        if (!node) {
            let param = this.templeteMap.get(name);
            node = instantiate(param);
        }
        return node;

    }

    put(name: string, element: any) {

        if (!name) {
            console.error(`PoolMgr-> put: name is null}`);
            return false;
        }
        if (!element) {

            return false;
        }
        let pool = this._pool(name);
        if (!pool) {
            return false;
        }

        pool.put(element);

        if (DEBUG) {
            console.log(`PoolMgr-> put: ${name} size: ${pool.count}`);
        }

        return true;
    }

    putAll(name: string, arr: Array<any>) {
        while (arr.length > 0) {
            let element = arr[0];
            arr.splice(0, 1);
            this.put(name, element);
        }
    }


    has(name: string): boolean {
        return this.nodePoolMap.has(name);
    }

    size(name: string) {
        let pool = this.nodePoolMap.get(name);
        if (!pool) {
            return -1;
        }
        return pool.count;
    }


    getPool(name: string) {
        return this.nodePoolMap.get(name);
    }



    private _pool(name: string): tnt.Pool<any> {
        let pool = null;
        if (name == this._currentNodePoolName) {
            pool = this._currentNodePool;
        } else {
            pool = this.nodePoolMap.get(name);
            if (!pool) {
                DEBUG && console.warn(`PoolMgr-> not have  [${name}] pool`);
                return null;
            }
            this._currentNodePool = pool;
            this._currentNodePoolName = name;
        }
        return pool;
    }


    createPrefabWithImageAsset(asset: SpriteFrame | Texture2D) {
        let node = new Node();
        let sprite = node.addComponent(Sprite);
        if (asset instanceof Texture2D) {
            sprite.spriteFrame.texture = asset;
        } else if (asset instanceof SpriteFrame) {
            sprite.spriteFrame = asset;
        }
        return this.createPrefabByNode(node);
    }

    //手动实现一个预制体
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



    deletePool(name: string) {
        if (this.nodePoolMap.has(name)) {
            let pool = this.nodePoolMap.get(name);
            if (pool instanceof tnt.NodePool) {
                pool.clear();
            } else {
                pool.resize(0);
            }
            this.nodePoolMap.delete(name);
        }

        if (this.templeteMap.has(name)) {
            let node = this.templeteMap.get(name);
            if (node instanceof Node || node instanceof Prefab) {
                node.destroy();
            }
            this.templeteMap.delete(name)
        }
    }

    releasePool(name) {
        this.deletePool(name);
        if (this.poolResMap.has(name)) {
            let poolRes = this.poolResMap.get(name);
            this.loader.releaseAsset(poolRes.path, poolRes.type, poolRes.bundle);
            this.poolResMap.delete(name);
        }
    }

    cleanAll() {
        this.nodePoolMap.forEach((pool) => {
            if (pool instanceof tnt.NodePool) {
                pool.clear();
            } else {
                pool.resize(0);
            }
        });
        this.nodePoolMap.clear();
        this.templeteMap.forEach((node) => {
            if (node instanceof Node || node instanceof Prefab) {
                node.destroy();
            }
        });
        this.templeteMap.clear();
        this.poolResMap.clear();
        tnt.loaderMgr.releaseLoader(this.loader);
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