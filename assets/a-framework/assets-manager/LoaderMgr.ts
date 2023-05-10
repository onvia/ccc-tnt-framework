import { js, log, sys } from "cc";
import { EDITOR } from "cc/env";

declare global{
    interface ITNT{
        loaderMgr: LoaderMgr;
    }
}

type AssetLoader = tnt.AssetLoader;

export class LoaderMgr {
    readonly KEY_UI_MGR = "UIMgr";
    readonly KEY_AUDIO = "audio";
    readonly KEY_SHARE = "share";
    readonly KEY_SPINE = "spine";
    private loaders: Map<any, AssetLoader> = new Map();
    public get share(): AssetLoader {
        let loader = tnt.AssetLoader.getInstance();
        loader.isValid = true;
        return loader;
    }

    public scene: AssetLoader = null;

    // 一个简单的池
    private pool = new Array<AssetLoader>();
    private _getLoader() {
        if (this.pool.length) {
            for (let i = 0; i < this.pool.length; i++) {
                const loader = this.pool[i];
                if(loader.loadCount > 0){
                    continue;
                }
                js.array.fastRemoveAt(this.pool,i);
                return loader;
            }
        }
        let loader = new tnt.AssetLoader();
        return loader;
    }
    private _putLoader(loader: AssetLoader) {
        loader.windowName = "";
        this.pool.push(loader);
    }


    /**
     * 可以从外部传入自定义的 loader
     * @param key 
     * @param loader 
     */
    public set(key: any, loader: AssetLoader) {
        if (key === this.KEY_SHARE) {
            console.warn(`LoaderMgr-> 不能对 share loader 进行替换`);
            return;
        }
        if (typeof key !== 'string') {
            key = js.getClassName(key);
        }
        if (this.loaders.has(key)) {
            console.warn(`LoaderMgr-> 已经存在同名 Loader`);
        }
        this.loaders.set(key, loader);
    }

    /**
     * 获取 loader ，如果不存在则创建一个
     * @param key 
     * @returns 
     */
    public get(key: any): AssetLoader {
        if (EDITOR) {
            return;
        }
        if(!key){
            key = this.KEY_SHARE;
        }
        // if (typeof key !== 'string') {
        //     key = js.getClassName(key);
        // }

        if (key === this.KEY_SHARE) {
            return this.share;
        }
        if (this.loaders.has(key)) {
            return this.loaders.get(key);
        }

        let loader = this._getLoader()
        loader.key = key;
        loader.isValid = true;
        this.loaders.set(key, loader);
        return loader;
    }

    /**
     * 释放 loader 中所有的资源，并将 loader 放入到池
     * @param key 
     */
    public releaseLoader(key: any) {
        // if (typeof key !== 'string') {
        //     key = js.getClassName(key);
        // }
        if(!key){
            key = this.KEY_SHARE;
        }
        // share 只进行资源释放
        if(key === this.KEY_SHARE){
            this.share.releaseAll();
            return;
        }

        let loader: AssetLoader = null;
        if(key instanceof tnt.AssetLoader){
            loader = key;
            key = key.key;
        }

        if(this.loaders.has(key)){
            loader = this.loaders.get(key);
            loader.releaseAll();
            this.loaders.delete(key);
            this._putLoader(loader);
        } else {
            // 没有在 map 中的不放到池内
            loader?.releaseAll();
            log(`LoaderMgr-> [ ${key} ] 不存在！`);
        }

        loader && (loader.isValid = false);
    }

    /**
     * 释放所有loader 中的资源。
     */
     public releaseAll() {
        this.loaders.forEach(loader => {
            loader.releaseAll();
            this._putLoader(loader);
        })
        this.loaders.clear();

        // 进行垃圾回收
        sys.garbageCollect();
    }
    
    public releaseBundle(bundleName: string){
        this.loaders.forEach(loader => {
            loader.releaseBundle(bundleName);
        })
    }
    private static _instance: LoaderMgr = null
    public static getInstance(): LoaderMgr {
        if (!this._instance) {
            this._instance = new LoaderMgr();
        }
        return this._instance;
    }
}

export let loaderMgr = LoaderMgr.getInstance();
tnt.loaderMgr = loaderMgr;