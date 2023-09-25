import { BundleWrap } from "./BundleWrap";
import { AssetWrap } from "./AssetWrap";

import { Asset, assetManager, AssetManager, js, path, Prefab, resources, SceneAsset, SpriteFrame, __private, Texture2D, warn, JsonAsset } from "cc";
import { EDITOR } from "cc/env";
import downloadFile from "./download-file";
import "../decorators/_decorator";
const { pluginMgr } = tnt._decorator;

type Bundle = AssetManager.Bundle;
let _handlerExts = [];
declare global {

    type CCAssetType<T = Asset> = __private._types_globals__Constructor<T>;
    type CCIAssetOptions = {
        [key: string]: any;
        preset?: "string";
    } | null;

    type CCProgressCallback = ((finished: number, total: number, item: RequestItem) => void) | null;
    type CCCompleteCallbackWithData<T = any> = ((err: Error | null, data: T) => void) | null;
    type RequestItem = AssetManager.RequestItem;

    type LoadBundleAssetCompleteFunc = (err: Error | null, bundle: BundleWrap | null) => void;
    type LoadBundleCompleteFunc = (err: Error | null, bundle: Bundle | null) => void;

    type CCCompleteCallbackNoData = ((err?: Error | null) => void) | null;


    interface IParameters<T> {
        options: CCIAssetOptions;
        onProgress: CCProgressCallback | null;
        onComplete: T | null;
    }

    interface IAssetLoaderPlugin {
        name: string;
        priority?: number;
        onLoadComplete(loader: AssetLoader, path: string, asset: Asset, bundle: Bundle): void;
        onLoadDirComplete(loader: AssetLoader, path: string, assets: Asset[], bundle: Bundle): void;
        onLoadArrayComplete(loader: AssetLoader, path: string[], assets: Asset[], bundle: Bundle): void;
        onLoadSceneComplete(loader: AssetLoader, sceneName: string, scene: SceneAsset, bundle: Bundle): void;

        onAssetPreProcessing(loader: AssetLoader, path: string, asset: Asset, bundle: Bundle): Asset;

        onRelease(loader: AssetLoader, path: string, asset: Asset): void;
    }


    interface ITNT {
        AssetLoader: typeof AssetLoader;
    }

    namespace tnt {
        type AssetLoader = InstanceType<typeof AssetLoader>;
    }

    interface IPluginType {
        AssetLoader: IAssetLoaderPlugin;
    }
}


class Cache {
    // 考虑到 相同路径不同类型的资源，所以这里使用数组形式
    map: Map<string, Array<AssetWrap>>;
    info: Map<string, string>;
    constructor() {
        this.map = new Map();
        this.info = new Map(); // key [asset uuid]: value [asset path]
    }
    set(path, asset: AssetWrap) {
        let has = this.map.has(path);
        let assetWrapArray: AssetWrap[] = null;
        if (has) {
            assetWrapArray = this.map.get(path);
        } else {
            assetWrapArray = [];
            this.map.set(path, assetWrapArray);
        }
        // 记录 uuid 对应的 path
        this.info.set(asset.asset.uuid || asset.asset._uuid, path);
        assetWrapArray.push(asset);
    }
    get(path, type: CCAssetType): AssetWrap {
        let has = this.map.has(path);
        if (has) {
            let assetWraps = this.map.get(path);
            let typeName = js.getClassName(type)
            for (let i = 0; i < assetWraps.length; i++) {
                const asset = assetWraps[i];
                let assetClassName = js.getClassName(asset.asset);
                if (assetClassName == typeName) {
                    return asset;
                }
            }
        }
        return null;
    }

    getPathByAsset(asset: Asset) {
        if (!asset) {
            return null;
        }
        return this.info.get(asset.uuid || asset._uuid);
    }

    delete(path: string, type: CCAssetType) {
        let has = this.map.has(path);
        if (has) {
            let assetWraps = this.map.get(path);
            let typeName = js.getClassName(type)
            for (let i = 0; i < assetWraps.length; i++) {
                const assetWrap = assetWraps[i];
                let assetClassName = js.getClassName(assetWrap.asset);
                if (assetClassName == typeName) {
                    assetWraps.splice(i, 1);
                    if (!assetWraps.length) {
                        this.map.delete(path);
                    }
                    return assetWrap;
                }
            }
        }
        return null;
    }

    forEach(callbackfn: (value: AssetWrap, key: string, map: Cache) => void, thisArg?: any) {
        this.map.forEach((arr, key) => {
            for (let i = 0; i < arr.length; i++) {
                const asset = arr[i];
                callbackfn(asset, key, this);
            }
        }, thisArg);
    }

    clear() {
        this.map.clear();
    }

}


@pluginMgr("AssetLoader")
class AssetLoader implements IPluginMgr {

    protected static loadedBundles: Map<string, BundleWrap> = new Map();
    protected static bundleVersions: Map<string, string> = null;
    public static ___plugins: IAssetLoaderPlugin[] = [];

    /**
     * 是否在 Bundle 引用计数归零的时候自动释放 Bundle 
     */
    public static autoReleaseBundle: boolean = false;

    /**
     * 默认 Bundle
     */
    public static defaultBundle: string = "resources";


    public key: string = "";
    public windowName: string = "";

    protected _cache: Cache = new Cache();
    public get cache() {
        return this._cache;
    }

    private _level = 0;
    private _loadCount = 0;
    public get loadCount() {
        return this._loadCount;
    }
    public isValid = false;


    /**
     * 获取 Bundle 版本
     */
    public static getBundleVersions(bundleName: string): string | undefined {
        if (this.bundleVersions == null) return null;
        return this.bundleVersions.get(bundleName);
    }
    /**
     * 更新 Bundle 版本
     */
    public static updateBundleVersion(bundleName: string, version: string | number) {
        this.bundleVersions.set(bundleName, version.toString());
    }

    /** 删除bundle */
    public static removeBundle(nameOrUrl: string) {
        let bundleWrap = this.loadedBundles.get(nameOrUrl);
        if (bundleWrap) {
            this.loadedBundles.delete(nameOrUrl);
            if (nameOrUrl != resources.name)
                assetManager.removeBundle(bundleWrap.bundle);
        }
    }

    /**
     * 加载 bundle
     * @param bundleName 
     */
    public static loadBundle(bundleName: string | Bundle, onComplete: LoadBundleCompleteFunc) {
        this.loadBundleWrap(bundleName, (err: Error | null, bundleWrap: BundleWrap | null) => {
            if (err == null) {
                onComplete?.(null, bundleWrap.bundle);
            } else {
                onComplete?.(err, null);
            }
        });
    }

    /**
     * 加载 包装 Bundle
     * @param bundleName 
     */
    protected static loadBundleWrap(bundleName: string | Bundle, onComplete: LoadBundleAssetCompleteFunc) {

        if (!bundleName) {
            bundleName = this.defaultBundle || resources.name;
        }

        if (bundleName instanceof AssetManager.Bundle) {
            bundleName = bundleName.name;
        }
        let bundle = this.loadedBundles.get(bundleName);
        if (bundle) {
            onComplete?.(null, bundle);
        } else {
            if (bundleName == resources.name) {
                bundle = new BundleWrap(bundleName, resources);
                this.loadedBundles.set(bundleName, bundle);
                onComplete?.(null, bundle);
            } else {
                let options: any = {}
                // if(onprogress){
                //     options.onFileProgress = (loaded: number, total: number)=>{
                //         onprogress(loaded/total);
                //     }
                // }
                let version = this.getBundleVersions(bundleName)
                if (version) {
                    options.version = version;
                }

                assetManager.loadBundle(bundleName, options, (err: Error | null, data: Bundle) => {
                    if (err == null) {
                        if (this.loadedBundles.has(bundleName as string)) {
                            bundle = this.loadedBundles.get(bundleName as string);
                        } else {
                            bundle = new BundleWrap(bundleName as string, data);
                            this.loadedBundles.set(bundleName as string, bundle);
                        }
                        onComplete?.(null, bundle);
                    } else {
                        onComplete?.(err, null);
                    }
                });
            }
        }
    }

    public static getBundleWrap(name: string) {
        let bundleWrap = this.loadedBundles.get(name);
        return bundleWrap;
    }

    public static getBundle(name: string) {
        let bundleWrap = this.loadedBundles.get(name);
        return bundleWrap?.bundle;
    }

    public removeBundle(nameOrUrl: string) {
        return AssetLoader.removeBundle(nameOrUrl);
    }

    public loadBundle(bundleName: string | Bundle, onComplete: LoadBundleCompleteFunc) {
        return AssetLoader.loadBundle(bundleName, onComplete);
    }

    public loadBundleWrap(bundleName: string | Bundle, onComplete: LoadBundleAssetCompleteFunc) {
        return AssetLoader.loadBundleWrap(bundleName, onComplete);
    }

    public getBundle(name: string) {
        return AssetLoader.getBundle(name);
    }


    protected _addCount() {
        this._loadCount++;
    }

    protected _decCount() {
        this._loadCount--;
    }

    /**
     * 升维  
     * 正在加载的资源不会执行 onProgress & onComplete 回调  
     * 加载完成后，如果当前 加载器 isValid == false 资源也不会被释放  
     *
     * @memberof AssetLoader
     */
    public boost() {
        this._level++;
    }

    private onLoadArrayComplete(path: string[], assets: Asset[], bundle: Bundle) {
        AssetLoader.___plugins.forEach((plugin) => {
            plugin.onLoadArrayComplete(this, path, assets, bundle);
        });
    }
    private onLoadComplete(path: string, asset: Asset, bundle: Bundle) {
        AssetLoader.___plugins.forEach((plugin) => {
            plugin.onLoadComplete(this, path, asset, bundle);
        });
    }

    private onLoadDirComplete(path: string, assets: Asset[], bundle: Bundle) {
        AssetLoader.___plugins.forEach((plugin) => {
            plugin.onLoadDirComplete(this, path, assets, bundle);
        });
    }

    private onRelease(path: string, asset: Asset) {
        AssetLoader.___plugins.forEach((plugin) => {
            plugin.onRelease(this, path, asset);
        });
    }

    private onLoadSceneComplete(sceneName: string, scene: SceneAsset, bundle: Bundle) {
        AssetLoader.___plugins.forEach((plugin) => {
            plugin.onLoadSceneComplete(this, sceneName, scene, bundle);
        });
    }

    /** 预处理资源 */
    private onAssetPreProcessing(path: string, asset: Asset, bundle: Bundle) {
        let final_asset = asset;
        AssetLoader.___plugins.forEach((plugin) => {
            final_asset = plugin.onAssetPreProcessing(this, path, final_asset, bundle);
        });
        return final_asset;
    }

    registerPlugin?(plugins: IPluginCommon | IPluginCommon[]);
    unregisterPlugin?(plugin: IPluginCommon | string);

    /**
     * 只会释放当前 AssetLoader 持有的指定 Bundle 资源
     *
     * @param {string} bundleName
     * @return {*} 
     * @memberof AssetLoader
     */
    public releaseBundle(bundleName: string) {

        let bundleWrap = this.getBundleAsset(bundleName);
        if (!bundleWrap) {
            return;
        }
        let releaseArr: AssetWrap[] = [];
        // 查找目录下的文件
        this._cache.forEach((assetWrap: AssetWrap) => {
            if (assetWrap.bundle.name === bundleWrap.name) {
                releaseArr.push(assetWrap);
            }
        })

        // 释放资源
        for (let i = 0; i < releaseArr.length; i++) {
            const releaseAsset = releaseArr[i];
            releaseAsset.decRef();
            if (releaseAsset.refCount <= 0) {
                let u_path = this.jointKey(bundleWrap.name, releaseAsset.path);
                let className = js.getClassName(releaseAsset.asset);
                let clazz = js.getClassByName(className);
                let assetWrap = this._cache.delete(u_path, clazz as any);
                assetWrap && this.onRelease(assetWrap.path, assetWrap.asset);
            }
        }
    }

    // 先对包装层资源进行计数 --
    public releaseAsset<T extends Asset>(asset: Asset)
    public releaseAsset<T extends Asset>(path: string, type: CCAssetType<T>)
    public releaseAsset<T extends Asset>(path: string, type: CCAssetType<T>, bundle: Bundle | string)
    public releaseAsset<T extends Asset>(pathOrAsset: string | Asset, type?: CCAssetType<T>, bundle?: Bundle | string) {
        if (!pathOrAsset) {
            return;
        }
        if (pathOrAsset instanceof Asset) {
            this._releaseOneAsset(pathOrAsset);
            return;
        }
        let pathObj = this.parsePath(pathOrAsset);
        let path = pathObj.path;

        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }
        path = this.formatPath(path, type);
        let bundleWrap = this.getBundleAsset(bundle);
        let u_path = this.jointKey(bundleWrap.name, path);

        let asset = this._cache.get(u_path, type);
        if (asset) {
            asset.decRef();
            if (asset.refCount <= 0) {
                let assetWrap = this._cache.delete(u_path, type);
                assetWrap && this.onRelease(assetWrap.path, assetWrap.asset);
            }
        }
    }

    private _releaseOneAsset(asset: Asset) {
        if (!asset) {
            return;
        }
        const u_path = this._cache.getPathByAsset(asset);
        // 判断当前 Loader 是否包含 指定资源
        if (u_path) {
            let className = js.getClassName(asset)
            let clazz = js.getClassByName(className) as __private._types_globals__Constructor<Asset>;
            if (asset) {
                asset.decRef();
                if (asset.refCount <= 0) {
                    let assetWrap = this._cache.delete(u_path, clazz);
                    assetWrap && this.onRelease(assetWrap.path, assetWrap.asset);
                }
            }
        }
    }

    /** 释放目录 */
    public releaseDir<T extends Asset>(dir: string, type: CCAssetType<T>, bundle?: Bundle | string) {
        let bundleWrap = this.getBundleAsset(bundle);
        let releaseArr: AssetWrap[] = [];
        // 查找目录下的文件
        this._cache.forEach((assetWrap: AssetWrap) => {
            let typeName = js.getClassName(type)
            let assetClassName = js.getClassName(assetWrap.asset);
            if (assetClassName == typeName && assetWrap.path.startsWith(dir)) {
                releaseArr.push(assetWrap);
            }
        })

        // 释放资源
        for (let i = 0; i < releaseArr.length; i++) {
            const releaseAsset = releaseArr[i];
            releaseAsset.decRef();
            if (releaseAsset.refCount <= 0) {
                let u_path = this.jointKey(bundleWrap.name, releaseAsset.path);
                let assetWrap = this._cache.delete(u_path, type);
                assetWrap && this.onRelease(assetWrap.path, assetWrap.asset);
            }
        }
    }

    /** 直接释放引用资源，不对包装层做判断 */
    public releaseAll() {
        this._cache?.forEach((assetWrap: AssetWrap) => {
            // asset.asset.decRef();
            assetWrap.destroy();
            this.onRelease(assetWrap.path, assetWrap.asset);
        });
        this._cache?.clear();
    }

    /** 是否已经加载 */
    public hasAsset(path: string, type: CCAssetType, bundle?: Bundle | string) {
        return !!this.getAsset(path, type, bundle);
    }

    /** 获取已加载的资源 */
    public getAsset(path: string, type: CCAssetType, bundle?: Bundle | string) {

        let pathObj = this.parsePath(path);
        path = pathObj.path;
        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }

        let bundleWrap = this.getBundleAsset(bundle);
        let u_path = this.jointKey(bundleWrap.name, path);
        let asset = this._cache.get(u_path, type);
        return asset;
    }

    /** 获取 Bundle 包装对象 */
    private getBundleAsset(bundle?: Bundle | string) {
        if (!bundle) {
            bundle = resources.name;
        } else if (bundle instanceof AssetManager.Bundle) {
            bundle = bundle.name;
        }

        let bundleWrap = AssetLoader.loadedBundles.get(bundle);
        if (!bundleWrap) {
            return null;
        }
        return bundleWrap;
    }

    public preload(paths: string | string[], type: CCAssetType, _bundle?: Bundle | string): void
    public preload(paths: string | string[], type: CCAssetType, _onComplete?: CCCompleteCallbackWithData<RequestItem[]>, _bundle?: Bundle | string): void
    public preload(paths: string | string[], type: CCAssetType, _onProgress: CCProgressCallback, _onComplete: CCCompleteCallbackWithData<RequestItem[]>, _bundle?: Bundle | string): void;
    public preload(paths: string | string[], type: CCAssetType, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string, _onComplete?: CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string, _bundle?: Bundle | string) {

        let pathBundle = null;
        // 暂时只对单独资源做 bundle 解析
        if (typeof paths === 'string') {
            let pathObj = this.parsePath(paths);
            paths = pathObj.path;
            pathBundle = pathObj.bundle;
        }

        let obj = this.parsingLoadArgs(_onProgress, _onComplete, _bundle);

        let { onProgress, onComplete, bundle } = obj;

        if (typeof paths === 'string') {
            // 优先使用路径内的 bundle 
            if (pathBundle) {
                bundle = pathBundle;
            }
        }
        this.loadBundleWrap(bundle, (err, bundleWrap) => {
            if (err) {

                onComplete?.(err, null);
                return;
            }

            _onProgress = (finish: number, total: number, item: AssetManager.RequestItem) => {
                onProgress?.(finish, total, item);
            }
            // 保留，否则会在父类里面解析错误
            _onComplete = (error: Error, assets: any) => {
                onComplete?.(error, assets);
            }
            if (!Array.isArray(paths)) {
                paths = [paths];
            }

            // 对路径进行格式化
            for (let i = 0; i < paths.length; i++) {
                paths[i] = this.formatPath(paths[i], type);
            }
            bundleWrap.bundle.preload(paths, type, _onProgress, _onComplete);
        });

    }

    public loadArray<T extends Asset>(paths: string[], type: CCAssetType<T>, _bundle?: Bundle | string)
    public loadArray<T extends Asset>(paths: string[], type: CCAssetType<T>, _onComplete?: CCCompleteCallbackWithData<T[]>, _bundle?: Bundle | string)
    public loadArray<T extends Asset>(paths: string[], type: CCAssetType<T>, _onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData<T[]>, _bundle?: Bundle | string)
    public loadArray<T extends Asset>(paths: string[], type: CCAssetType<T>, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<T[]> | Bundle | string, _onComplete?: CCCompleteCallbackWithData<T[]> | Bundle | string, _bundle?: Bundle | string) {
        this._addCount();

        let { onProgress, onComplete, bundle } = this.parsingLoadArgs(_onProgress, _onComplete, _bundle);

        let _level = this._level;
        this.loadBundleWrap(bundle, (err, bundleWrap) => {

            if (err) {
                let isSameLevel = _level == this._level;
                this._decCount();
                isSameLevel && onComplete?.(err, null);
                return;
            }

            if (!Array.isArray(paths)) {
                paths = [paths];
            }

            // 对路径进行格式化
            for (let i = 0; i < paths.length; i++) {
                paths[i] = this.formatPath(paths[i], type);
            }
            bundleWrap.bundle.load(paths, type, (finish: number, total: number, item) => {
                if (_level != this._level || !this.isValid) {
                    return;
                }
                onProgress?.(finish, total, item);
            }, (error: Error, assets: T[]) => {
                this._decCount();
                let isSameLevel = _level == this._level;

                if (error) {
                    isSameLevel && onComplete?.(error, assets);
                    return;
                }
                // 重新分配元素
                assets = assets.map((asset) => {

                    if (!this.isValid && isSameLevel) {
                        asset.addRef();
                        asset.decRef();
                        return null;
                    }
                    let uuid = asset.uuid || asset._uuid;
                    let info = bundleWrap.bundle.getAssetInfo(uuid);
                    if (!info) {
                        console.warn(`AssetLoader-> loadDir 资源错误 ${uuid}`);
                        return null;
                    }
                    // @ts-ignore
                    let path = info.path;
                    let u_path = this.jointKey(bundleWrap.name, path);
                    let assetWrap = this._cache.get(u_path, type);
                    if (!assetWrap) {
                        asset = this.onAssetPreProcessing(path, asset, bundleWrap.bundle) as any;
                        assetWrap = new AssetWrap(path, asset, bundleWrap);
                        this._cache.set(u_path, assetWrap);
                    } else {
                        asset = assetWrap.asset as T;
                    }
                    assetWrap.addRef();
                    return asset;
                });

                if (!this.isValid) {
                    return;
                }

                if (isSameLevel) {
                    this.onLoadArrayComplete(paths, assets, bundleWrap.bundle);
                    onComplete?.(error, assets);
                }
            });
        });

    }

    public load<T extends Asset>(path: string, type: CCAssetType<T>, _bundle?: Bundle | string)
    public load<T extends Asset>(path: string, type: CCAssetType<T>, _onComplete?: CCCompleteCallbackWithData<T>, _bundle?: Bundle | string)
    public load<T extends Asset>(path: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData<T>, _bundle?: Bundle | string)
    public load<T extends Asset>(path: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<T> | Bundle | string, _onComplete?: CCCompleteCallbackWithData<T> | Bundle | string, _bundle?: Bundle | string) {
        this._addCount();
        let _level = this._level;
        let pathObj = this.parsePath(path);
        path = pathObj.path;

        // 对路径进行格式化
        path = this.formatPath(path, type);

        let obj = this.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        let { onProgress, onComplete, bundle } = obj;

        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }

        this.loadBundleWrap(bundle, (err, bundleWrap) => {

            if (err) {
                let isSameLevel = _level == this._level;
                this._decCount();
                isSameLevel && onComplete?.(err, null);
                return;
            }

            let u_path = this.jointKey(bundleWrap.name, path);

            bundleWrap.bundle.load(path, type as any, (finish: number, total: number, item) => {
                if (_level != this._level || !this.isValid) {
                    return;
                }
                onProgress?.(finish, total, item);
            }, (error: Error, asset: T) => {
                this._decCount();
                let isSameLevel = _level == this._level;
                if (error) {
                    isSameLevel && onComplete?.(error, asset);
                } else {
                    if (!this.isValid && isSameLevel) {
                        asset.addRef();
                        asset.decRef();
                        return;
                    }

                    // 如果在 _cache 中存在，直接返回
                    let assetWrap = this._cache.get(u_path, type);
                    if (assetWrap) {
                        assetWrap.addRef();
                        let _asset: Asset = assetWrap.asset;
                        if (isSameLevel) {
                            this.onLoadComplete(path, _asset, bundleWrap.bundle);
                            onComplete?.(null, _asset);
                        }
                        return;
                    }

                    asset = this.onAssetPreProcessing(path, asset, bundleWrap.bundle) as T;

                    assetWrap = new AssetWrap(path, asset, bundleWrap);
                    assetWrap.addRef();
                    this._cache.set(u_path, assetWrap);

                    if (isSameLevel) {
                        this.onLoadComplete(path, asset, bundleWrap.bundle);
                        onComplete?.(error, asset);
                    }
                }
            });
        });
    }

    public preloadDir(dir: string, type: CCAssetType | null, _bundle?: Bundle | string)
    public preloadDir(dir: string, type: CCAssetType | null, _onProgress: CCProgressCallback | null, _onComplete: CCCompleteCallbackWithData<RequestItem[]> | null, _bundle?: Bundle | string)
    public preloadDir(dir: string, type: CCAssetType | null, _onComplete?: CCCompleteCallbackWithData<RequestItem[]> | null, _bundle?: Bundle | string)
    public preloadDir(dir: string, type?: CCAssetType, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string, _onComplete?: CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string, _bundle?: Bundle | string) {
        let pathObj = this.parsePath(dir);
        let path = pathObj.path;
        let { onProgress, onComplete, bundle } = this.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }
        this.loadBundleWrap(bundle, (err, bundleWrap) => {
            if (err) {
                onComplete?.(err, null);
                return;
            }
            _onProgress = (finish: number, total: number, item: AssetManager.RequestItem) => {
                onProgress?.(finish, total, item);
            }
            // 保留，否则会在父类里面解析错误
            _onComplete = (error: Error, assets: any) => {
                onComplete?.(error, assets);
            }

            bundleWrap.bundle.preloadDir(path, type, _onProgress, _onComplete);
        });

    }
    public loadDir<T extends Asset>(dir: string, type: CCAssetType<T>, _bundle?: Bundle | string)
    public loadDir<T extends Asset>(dir: string, type: CCAssetType<T>, _onComplete?: CCCompleteCallbackWithData<T[]>, _bundle?: Bundle | string)
    public loadDir<T extends Asset>(dir: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData<T[]>, _bundle?: Bundle | string)
    public loadDir<T extends Asset>(dir: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<T[]> | Bundle | string, _onComplete?: CCCompleteCallbackWithData<T[]> | Bundle | string, _bundle?: Bundle | string) {
        this._addCount();
        let _level = this._level;
        let pathObj = this.parsePath(dir);
        let path = pathObj.path;

        let { onProgress, onComplete, bundle } = this.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }
        this.loadBundleWrap(bundle, (err, bundleWrap) => {
            if (err) {
                let isSameLevel = _level == this._level;
                this._decCount();
                isSameLevel && onComplete?.(err, null);
                return;
            }
            bundleWrap.bundle.loadDir(path, type as any, (finish: number, total: number, item: RequestItem) => {
                if (_level != this._level || !this.isValid) {
                    return;
                }
                onProgress?.(finish, total, item);
            }, (error: Error, assets: Array<T>) => {
                this._decCount();

                let isSameLevel = _level == this._level;

                if (error) {
                    isSameLevel && onComplete?.(error, assets);
                    return;
                }
                // 重新分配元素
                assets = assets.map((asset) => {
                    if (!this.isValid && isSameLevel) {
                        asset.addRef();
                        asset.decRef();
                        return null;
                    }
                    let uuid = asset.uuid || asset._uuid;
                    let info = bundleWrap.bundle.getAssetInfo(uuid);
                    if (!info) {
                        console.warn(`AssetLoader-> loadDir 资源错误 ${uuid}`);
                        return null;
                    }
                    // @ts-ignore
                    let path = info.path;
                    let u_path = this.jointKey(bundleWrap.name, path);
                    let assetWrap = this._cache.get(u_path, type);
                    if (!assetWrap) {

                        asset = this.onAssetPreProcessing(path, asset, bundleWrap.bundle) as any;
                        assetWrap = new AssetWrap(path, asset, bundleWrap);
                        this._cache.set(u_path, assetWrap);
                    } else {

                    }
                    assetWrap.addRef();
                    return asset;
                });

                if (!this.isValid) {
                    return;
                }

                if (isSameLevel) {
                    this.onLoadDirComplete(path, assets, bundleWrap.bundle);
                    onComplete?.(error, assets);
                }
            });
        });
    }

    public loadScene(sceneName: string, _bundle?: AssetManager.Bundle | string)
    public loadScene(sceneName: string, _onComplete?: CCCompleteCallbackWithData, _bundle?: AssetManager.Bundle | string)
    public loadScene(sceneName: string, _onProgress: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData, _bundle?: AssetManager.Bundle | string)
    public loadScene(sceneName: string, _onProgress: CCProgressCallback | CCCompleteCallbackWithData | AssetManager.Bundle | string, _onComplete?: CCCompleteCallbackWithData | AssetManager.Bundle | string, _bundle?: AssetManager.Bundle | string) {

        let pathObj = this.parsePath(sceneName);
        sceneName = pathObj.path;

        let { onProgress, onComplete, bundle } = this.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }

        if (!bundle) {
            bundle = assetManager.bundles.find((bundle) => {
                return !!bundle.getSceneInfo(sceneName);
            });
        }
        this.loadBundleWrap(bundle, (err, bundleWrap) => {
            if (err) {
                onComplete?.(err, null);
                return;
            }
            // 加载 场景资源
            bundleWrap.bundle.loadScene(sceneName, (finish: number, total: number, item: AssetManager.RequestItem) => {
                onProgress?.(finish, total, item);
            }, (error: Error, assets: SceneAsset) => {
                // await this.onComplete(error,assets);

                assets = this.onAssetPreProcessing(sceneName, assets, bundleWrap.bundle) as any;
                this.onLoadSceneComplete(sceneName, assets, bundleWrap.bundle);
                onComplete?.(error, assets);
            });
        });
    }

    public preloadScene(sceneName: string, bundle?: AssetManager.Bundle | string)
    public preloadScene(sceneName: string, onComplete?: CCCompleteCallbackNoData, bundle?: AssetManager.Bundle | string)
    public preloadScene(sceneName: string, options?: CCIAssetOptions | null, bundle?: AssetManager.Bundle | string)
    public preloadScene(sceneName: string, options?: CCIAssetOptions | null, onComplete?: CCCompleteCallbackNoData, bundle?: AssetManager.Bundle | string)
    public preloadScene(sceneName: string, onProgress?: CCProgressCallback, onComplete?: CCCompleteCallbackNoData, bundle?: AssetManager.Bundle | string)
    public preloadScene(sceneName: string, _options?: CCIAssetOptions | null | CCProgressCallback | AssetManager.Bundle | string, _onProgress?: CCProgressCallback | CCCompleteCallbackNoData | AssetManager.Bundle | string, _onComplete?: CCCompleteCallbackNoData | AssetManager.Bundle | string, _bundle?: AssetManager.Bundle | string) {
        let pathObj = this.parsePath(sceneName);
        sceneName = pathObj.path;

        let { options, onProgress, onComplete, bundle } = this.parseParameters(_options, _onProgress, _onComplete, _bundle);
        // 优先使用路径内的 bundle 
        if (pathObj.bundle) {
            bundle = pathObj.bundle;
        }
        if (!bundle) {
            bundle = assetManager.bundles.find((bundle) => {
                return !!bundle.getSceneInfo(sceneName);
            });
        }
        this.loadBundleWrap(bundle, (err, bundleWrap) => {
            if (err) {
                onComplete?.(err, null);
                return;
            }
            // 加载 场景资源
            bundleWrap.bundle.preloadScene(sceneName, options, (finish: number, total: number, item: AssetManager.RequestItem) => {
                onProgress?.(finish, total, item);
            }, (error: Error) => {
                // await this.onComplete(error,assets);
                onComplete?.();
            });
        });
    }

    /** 拼接 bundle 和 路径作为 key */
    protected jointKey(bundle: string, path: string) {
        return `${bundle}#${path}`;
    }

    /**
     * 解析并处理load方法的参数。根据传入参数的类型和数量，调整onProgress（进度回调）、onComplete（完成回调）和 bundle 的值。
     * 这样处理使得函数可以灵活接收不同的参数类型和数量。
     *
     * @param {any[]} args - 传入的参数数组，可以包含回调函数和/或一个bundle
     * @return 返回一个包含 onProgress, onComplete 和 bundle 的对象
     */
    public parsingLoadArgs(...args: any) {
        // 定义进度回调、完成回调以及bundle变量
        let onProgress: CCProgressCallback, onComplete: CCCompleteCallbackWithData, bundle: string | Bundle;

        // 获取输入参数
        let _onProgress = args[0];
        let _onComplete = args[1];
        let _bundle = args[2];

        // 如果所有参数都存在
        if (_onProgress && _onComplete && _bundle) {
            onProgress = _onProgress;
            onComplete = _onComplete;
            bundle = _bundle;
        } else { // 否则，进行相应处理
            if (typeof _onProgress === 'function') { // 如果第一个参数是函数
                if (typeof _onComplete === 'function') { // 如果第二个参数也是函数
                    onProgress = _onProgress;
                    onComplete = _onComplete;
                } else if (typeof _onComplete === 'undefined') { // 如果第二个参数未定义
                    onComplete = _onProgress;
                } else { // 如果第二个参数既不是函数也不是未定义
                    onComplete = _onProgress;
                    bundle = _onComplete;
                }
            } else { // 如果第一个参数不是函数
                bundle = _onProgress;
            }
        }

        // 返回一个包含三个成员的对象：onProgress、onComplete、bundle
        return { onProgress, onComplete, bundle };
    }

    /**
     * 解析并处理参数。
     * 这个方法根据传入参数的类型和数量，调整 options、onProgress（进度回调）、onComplete（完成回调）和 bundle 的值。
     */
    public parseParameters(options: any, onProgress: any, onComplete: any, bundle: AssetManager.Bundle | string) {
        if (typeof onComplete === 'function') {
        } else if (typeof onComplete === 'string' || onComplete instanceof AssetManager.Bundle) {
            // 如果 onComplete 是字符串或者AssetManager.Bundle实例，调整参数位置
            bundle = onComplete;
            onComplete = onProgress;
            onProgress = null
        } else if (!onComplete) {
            // 如果 onComplete 不存在，根据 onProgress 的类型调整参数
            if (typeof onProgress === 'function') {
                onComplete = onProgress;
                onProgress = null
            } else if (typeof onProgress === 'string' || onProgress instanceof AssetManager.Bundle) {
                bundle = onProgress;
                onProgress = null;
            } else if (!onProgress) {
                // 如果 onProgress 不存在，根据 options 的类型调整参数
                if (typeof options === 'function') {
                    onComplete = options;
                    options = null;
                } else if (typeof options === 'string' || options instanceof AssetManager.Bundle) {
                    bundle = options;
                    options = null;
                }
            }
        }
        // 如果 options 不存在，创建一个新的对象
        options = options || Object.create(null);
        return { options, onProgress, onComplete, bundle };
    }

    /**
     * 检查传入对象是否为 null 或者 undefined。
     *
     * @param {any} object - 任何类型的对象
     * @return {boolean} 如果对象是 null 或者 undefined，返回 true，否则返回 false
     */
    isNull(object: any): boolean {
        return object === null || object === undefined;
    }

    /**
     * 检查传入对象是否为 Object 类型（非 null、非数组、非函数等）。
     *
     * @param {any} object - 任何类型的对象
     * @return {boolean} 如果对象是 Object 类型，返回 true，否则返回 false
     */
    isObject(object: any): boolean {
        return Object.prototype.toString.call(object) === '[object Object]'
    }

    /**
      * 格式化路径，去除扩展名，并根据类型添加特定的后缀。
      *
      * @param {string} path - 资源路径
      * @param {CCAssetType<T>} type - 资源类型
      * @return {string} 返回格式化后的路径
      * @template T
      */
    formatPath<T extends Asset>(path: string, type: CCAssetType<T>): string {
        if (!path) {
            console.log(`AssetLoader-> `);
        }
        // 如果路径中包含扩展名，则删除
        let index = path.lastIndexOf('.');
        if (index !== -1) {
            path = path.substring(0, index);
        }

        // 根据资源类型在路径后加上特定的后缀
        if (js.getClassName(type) === js.getClassName(SpriteFrame)) {
            path += "/spriteFrame";
        } else if (js.getClassName(type) === js.getClassName(Texture2D)) {
            path += "/texture";
        }

        return path;
    }

    /**
     * 解析路径，提取出bundle和具体路径。
     * 路径格式应为 "bundle#path" 或 "path"
     *
     * @param {string} path - 资源路径
     * @return {Object} 返回包含解析后的路径和bundle的对象
     */
    parsePath(path: string): { path: string, bundle: string } {
        let bundle = null;
        // 以 '#' 为分隔符，分割路径字符串
        let arr = path.split("#");
        if (arr.length === 2) {
            // 如果路径包含 '#'，则把 '#' 前面的部分作为 bundle，后面的部分作为路径
            bundle = arr[0];
            path = arr[1];
        } else if (arr.length === 1) {
            // 如果路径中没有 '#'，则整个字符串就是路径
            path = arr[0];
        } else {
            // 如果 '#' 的数量不是预期中的个数则抛出错误
            throw new Error(`path  [${path}]  error`);
        }
        return { path, bundle };
    }

    /**
     *  注册加载二进制文件的解析
     *
     * @param {string} [ext]
     * @param {(file)=> any} [parserCallback]
     * @memberof ResourcesMgr
     */
    static registerLoadBinary(ext?: string, parserCallback?: (file) => any) {
        // 参考
        // https://docs.cocos.com/creator/manual/zh/release-notes/asset-manager-upgrade-guide.html
        // https://docs.cocos.com/creator/manual/zh/asset-manager/options.html#%E6%89%A9%E5%B1%95%E5%BC%95%E6%93%8E
        if (!ext) {
            ext = "bin";
        }
        if (_handlerExts.indexOf(ext) != -1) {
            warn(`[${ext}] LoadHandler is exist`);
            return;
        }
        if (!ext.startsWith('.')) {
            ext = '.' + ext;
        }
        _handlerExts.push(ext);

        let customDownloaderHandler = (url, options, onComplete) => {
            options.responseType = "arraybuffer";
            downloadFile(url, options, options.onFileProgress, onComplete);
        }
        let customParserHandler = (file, options, cb) => {
            if (parserCallback) {
                let array = parserCallback(file);
                cb(null, array);
            } else {
                let rawAsset = new Uint8Array(file);
                cb(null, rawAsset);
            }
        }
        assetManager.downloader.register(ext, customDownloaderHandler);
        assetManager.parser.register(ext, customParserHandler);
    }

    /**
     * 在编辑器中加载资源
     */
    static loadResInEditor<T>(path: string, type: CCAssetType<T>, callback: CCCompleteCallbackWithData<T>, bundle?: string) {
        if (EDITOR) {
            this.getUUIDFromMeta(path, type, function (uuid) {
                assetManager.loadAny({
                    uuid: uuid
                }, callback);
            }, bundle);
        }
    }

    /* 编辑器获取读取meta文件获取 uuid */
    static getUUIDFromMeta(filepath, type, callback, bundle = "resources") {
        if (EDITOR) {
            // @ts-ignore
            var path = require('path');
            // @ts-ignore
            var fs = require('fs');
            // @ts-ignore
            let projectPath = Editor.Project.path || Editor.projectPath;

            let exts = {};
            // @ts-ignore
            exts[Prefab] = "prefab";
            // @ts-ignore
            exts[JsonAsset] = "json";
            // @ts-ignore
            exts[SpriteFrame] = "png";


            let absolutePath = path.join(projectPath, "assets", bundle, `${filepath}.${exts[type]}.meta`);
            if (!fs.existsSync(absolutePath)) {
                warn(`[${absolutePath}]file is not exist `);
                return;
            }

            fs.readFile(absolutePath, function (err, data) {
                if (err) {
                    warn("parse uuid error = ", err || err.message);
                    return;
                }
                let dataStr = data.toString();
                let json = JSON.parse(dataStr);
                if (type === SpriteFrame || type === Texture2D) {
                    for (const key in json.subMetas) {
                        const subMeta = json.subMetas[key];
                        if (type === SpriteFrame && subMeta.name === "spriteFrame") {
                            callback(subMeta.uuid);
                            return;
                        }
                        if (type === Texture2D && subMeta.name === "texture") {
                            callback(subMeta.uuid);
                            return;
                        }
                    }
                    let uuid = json.uuid;
                    callback(uuid);
                } else {
                    let uuid = json.uuid;
                    callback(uuid);
                }
            });
        }
    }

    private static _instance: AssetLoader = null
    public static getInstance(): AssetLoader {
        if (!this._instance) {
            this._instance = new AssetLoader();
        }
        return this._instance;
    }
}

export { };

tnt.AssetLoader = AssetLoader;