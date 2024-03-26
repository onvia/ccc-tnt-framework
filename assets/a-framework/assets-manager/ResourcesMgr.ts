import { AssetManager, assetManager, Asset, Node, Prefab, instantiate, js, Sprite, SpriteFrame, isValid } from "cc";

declare global {
    interface ITNT {
        resourcesMgr: ResourcesMgr;
    }
}
type LoaderType = ILoaderKeyAble | tnt.AssetLoader | string;

type Bundle = AssetManager.Bundle;
class ResourcesMgr {

    public removeBundle(nameOrUrl: string) {
        return tnt.AssetLoader.removeBundle(nameOrUrl);
    }

    public loadBundle(bundleName: string | Bundle, onComplete: LoadBundleCompleteFunc) {
        tnt.AssetLoader.loadBundle(bundleName, onComplete);
    }

    public getLoader(key: LoaderType) {
        let loader = this._convertToLoader(key);
        return loader;
    }

    public preload(key: LoaderType, paths: string | string[], type: CCAssetType, _bundle?: Bundle | string): void
    public preload(key: LoaderType, paths: string | string[], type: CCAssetType, _onComplete?: CCCompleteCallbackWithData<RequestItem[]>, _bundle?: Bundle | string): void
    public preload(key: LoaderType, paths: string | string[], type: CCAssetType, _onProgress: CCProgressCallback, _onComplete: CCCompleteCallbackWithData<RequestItem[]>, _bundle?: Bundle | string): void;
    public preload(
        key: LoaderType,
        paths: string | string[],
        type: CCAssetType,
        _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string,
        _onComplete?: CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string,
        _bundle?: Bundle | string
    ) {
        let loader = this._convertToLoader(key);

        let obj = loader.parsingLoadArgs(_onProgress, _onComplete, _bundle);

        let { onProgress, onComplete, bundle } = obj;
        loader.loadBundleWrap(bundle, (err, bundleWrap) => {
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
                paths[i] = loader.formatPath(paths[i], type);
            }
            bundleWrap.bundle.preload(paths, type, _onProgress, _onComplete);
        });
    }


    public preloadDir(key: LoaderType, dir: string, type: CCAssetType | null, _bundle?: Bundle | string)
    public preloadDir(key: LoaderType, dir: string, type: CCAssetType | null, _onProgress: CCProgressCallback | null, _onComplete: CCCompleteCallbackWithData<RequestItem[]> | null, _bundle?: Bundle | string)
    public preloadDir(key: LoaderType, dir: string, type: CCAssetType | null, _onComplete?: CCCompleteCallbackWithData<RequestItem[]> | null, _bundle?: Bundle | string)
    public preloadDir(
        key: LoaderType,
        dir: string,
        type?: CCAssetType,
        _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string,
        _onComplete?: CCCompleteCallbackWithData<RequestItem[]> | null | Bundle | string,
        _bundle?: Bundle | string
    ) {
        let loader = this._convertToLoader(key);
        let { onProgress, onComplete, bundle } = loader.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        loader.loadBundleWrap(bundle, (err, bundleWrap) => {
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

            bundleWrap.bundle.preloadDir(dir, type, _onProgress, _onComplete);
        });

    }


    public preloadScene(key: LoaderType, sceneName: string, bundle?: AssetManager.Bundle | string)
    public preloadScene(key: LoaderType, sceneName: string, onComplete?: CCCompleteCallbackNoData, bundle?: AssetManager.Bundle | string)
    public preloadScene(key: LoaderType, sceneName: string, options?: CCIAssetOptions | null, bundle?: AssetManager.Bundle | string)
    public preloadScene(key: LoaderType, sceneName: string, options?: CCIAssetOptions | null, onComplete?: CCCompleteCallbackNoData, bundle?: AssetManager.Bundle | string)
    public preloadScene(key: LoaderType, sceneName: string, onProgress?: CCProgressCallback, onComplete?: CCCompleteCallbackNoData, bundle?: AssetManager.Bundle | string)
    public preloadScene(key: LoaderType, sceneName: string, _options?: CCIAssetOptions | null | CCProgressCallback | AssetManager.Bundle | string, _onProgress?: CCProgressCallback | CCCompleteCallbackNoData | AssetManager.Bundle | string, _onComplete?: CCCompleteCallbackNoData | AssetManager.Bundle | string, _bundle?: AssetManager.Bundle | string) {


        let loader = this._convertToLoader(key);
        let { options, onProgress, onComplete, bundle } = loader.parseParameters(_options, _onProgress, _onComplete, _bundle);
        if (!bundle) {
            bundle = assetManager.bundles.find((bundle) => {
                return !!bundle.getSceneInfo(sceneName);
            });
        }
        loader.loadBundleWrap(bundle, (err, bundleWrap) => {
            if (err) {
                onComplete?.(err);
                return;
            }
            // 加载 场景资源
            bundleWrap.bundle.preloadScene(sceneName, options, (finish: number, total: number, item: AssetManager.RequestItem) => {
                onProgress?.(finish, total, item);
            }, (error: Error) => {
                onComplete?.(error);
            });
        });
    }


    public loadArray<T extends Asset>(key: LoaderType, paths: string[], type: CCAssetType<T>, _bundle?: Bundle | string)
    public loadArray<T extends Asset>(key: LoaderType, paths: string[], type: CCAssetType<T>, _onComplete?: CCCompleteCallbackWithData<T[]>, _bundle?: Bundle | string)
    public loadArray<T extends Asset>(key: LoaderType, paths: string[], type: CCAssetType<T>, _onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData<T[]>, _bundle?: Bundle | string)
    public loadArray<T extends Asset>(key: LoaderType, paths: string[], type: CCAssetType<T>, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<T[]> | Bundle | string, _onComplete?: CCCompleteCallbackWithData<T[]> | Bundle | string, _bundle?: Bundle | string) {

        let loader = this._convertToLoader(key);

        let { onProgress, onComplete, bundle } = loader.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        _onProgress = (finish: number, total: number, item: AssetManager.RequestItem) => {
            onProgress?.(finish, total, item);
        }
        // 保留，否则会在加载器类里面解析错误
        _onComplete = async (error: Error, assets: any) => {
            onComplete?.(error, assets);
        }

        loader.loadArray(paths, type, _onProgress, _onComplete, bundle);
    }


    public load<T extends Asset>(key: LoaderType, path: string, type: CCAssetType<T>, _bundle?: AssetManager.Bundle | string)
    public load<T extends Asset>(key: LoaderType, path: string, type: CCAssetType<T>, _onComplete?: CCCompleteCallbackWithData<T>, _bundle?: AssetManager.Bundle | string)
    public load<T extends Asset>(key: LoaderType, path: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData<T>, _bundle?: AssetManager.Bundle | string)
    public load<T extends Asset>(key: LoaderType, path: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData<T> | AssetManager.Bundle | string, _onComplete?: CCCompleteCallbackWithData<T> | AssetManager.Bundle | string, _bundle?: AssetManager.Bundle | string) {
        let loader = this._convertToLoader(key);

        let { onProgress, onComplete, bundle } = loader.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        _onProgress = (finish: number, total: number, item: AssetManager.RequestItem) => {
            onProgress?.(finish, total, item);
        }
        // 保留，否则会在加载器类里面解析错误
        _onComplete = async (error: Error, assets: any) => {
            onComplete?.(error, assets);
        }
        loader.load(path, type, _onProgress, _onComplete, bundle);
    }


    public loadDir<T extends Asset>(key: LoaderType, dir: string, type: CCAssetType<T>, _bundle?: AssetManager.Bundle | string)
    public loadDir<T extends Asset>(key: LoaderType, dir: string, type: CCAssetType<T>, _onComplete?: CCCompleteCallbackWithData, _bundle?: AssetManager.Bundle | string)
    public loadDir<T extends Asset>(key: LoaderType, dir: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData, _bundle?: AssetManager.Bundle | string)
    public loadDir<T extends Asset>(key: LoaderType, dir: string, type: CCAssetType<T>, _onProgress?: CCProgressCallback | CCCompleteCallbackWithData | AssetManager.Bundle | string, _onComplete?: CCCompleteCallbackWithData | AssetManager.Bundle | string, _bundle?: AssetManager.Bundle | string) {
        let loader = this._convertToLoader(key);

        let { onProgress, onComplete, bundle } = loader.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        _onProgress = (finish: number, total: number, item: AssetManager.RequestItem) => {

            onProgress?.(finish, total, item);
        }
        // 保留，否则会在加载器类里面解析错误
        _onComplete = async (error: Error, assets: any) => {
            // await this.onComplete(error,assets);
            onComplete?.(error, assets);
        }

        loader.loadDir(dir, type, _onProgress, _onComplete, bundle);
    }

    public loadScene(key: LoaderType, sceneName: string, _bundle?: AssetManager.Bundle | string)
    public loadScene(key: LoaderType, sceneName: string, _onComplete?: CCCompleteCallbackWithData, _bundle?: AssetManager.Bundle | string)
    public loadScene(key: LoaderType, sceneName: string, _onProgress: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData, _bundle?: AssetManager.Bundle | string)
    public loadScene(key: LoaderType, sceneName: string, _onProgress: CCProgressCallback | CCCompleteCallbackWithData | AssetManager.Bundle | string, _onComplete?: CCCompleteCallbackWithData | AssetManager.Bundle | string, _bundle?: AssetManager.Bundle | string) {
        let loader = this._convertToLoader(key);

        let { onProgress, onComplete, bundle } = loader.parsingLoadArgs(_onProgress, _onComplete, _bundle);
        _onProgress = (finish: number, total: number, item: AssetManager.RequestItem) => {
            onProgress?.(finish, total, item);
        }
        // 保留，否则会在加载器类里面解析错误
        _onComplete = async (error: Error, assets: any) => {
            // await this.onComplete(error,assets);
            onComplete?.(error, assets);
        }
        loader.loadScene(sceneName, _onProgress, _onComplete, bundle);
    }


    // 解析资源地址
    public _parseAssetUrl<T>(cls: GConstructor<T>, param?: any) {
        // @ts-ignore
        let prefabUrl = cls.__$prefabUrl;
        if (typeof prefabUrl === "function") {
            prefabUrl = prefabUrl(param);
        }

        // @ts-ignore
        let bundle = cls.__$bundle;
        if (typeof bundle === "function") {
            bundle = bundle(param);
        }
        return { prefabUrl, bundle };
    }

    private _formatArgs<Options, T extends tnt.GComponent<Options>>(loaderKeyAble: LoaderType, clazz: GConstructor<T> | string) {

        if (!loaderKeyAble) {
            console.error(`ResourcesMgr-> loaderKeyAble 不能为空`);
            return;
        }

        let loader = this._convertToLoader(loaderKeyAble);

        let cls: GConstructor<T> = null;
        if (typeof clazz === 'string') {
            cls = js.getClassByName(clazz) as GConstructor<T>;
        } else {
            cls = clazz as GConstructor<T>;
        }

        return { loader, cls }
    }

    _convertToLoader(loaderKeyAble: LoaderType): tnt.AssetLoader {
        if (!loaderKeyAble) {
            console.error(`ResourcesMgr-> loaderKeyAble 不能为空`);
            return;
        }

        let loader: tnt.AssetLoader = null;
        if (loaderKeyAble instanceof tnt.AssetLoader) {
            loader = loaderKeyAble;
        } else if (typeof loaderKeyAble === 'string') {
            loader = tnt.loaderMgr.get(loaderKeyAble)
        } else {
            loader = tnt.loaderMgr.get(loaderKeyAble.loaderKey)
        }
        return loader;
    }

    /**
     * 更新 SpriteFrame
     *
     * @param {LoaderType} loaderKeyAble
     * @param {Sprite} spriteOrNode
     * @param {string} url
     * @param {string} [bundle]
     * @memberof ResourcesMgr
     */

    public updateSpriteFrame(loaderKeyAble: LoaderType, spriteOrNode: Sprite | Node, url: string, cb: Runnable): void
    public updateSpriteFrame(loaderKeyAble: LoaderType, spriteOrNode: Sprite | Node, url: string, bundle: string): void
    public updateSpriteFrame(loaderKeyAble: LoaderType, spriteOrNode: Sprite | Node, url: string, cb: Runnable, bundle: string): void
    public updateSpriteFrame(loaderKeyAble: LoaderType, spriteOrNode: Sprite | Node, url: string, cbOrBundle?: Runnable | string, bundle?: string): void
    public updateSpriteFrame(loaderKeyAble: LoaderType, spriteOrNode: Sprite | Node, url: string, cbOrBundle?: Runnable | string, bundle?: string): void {
        let loader = this._convertToLoader(loaderKeyAble);
        let sprite = spriteOrNode instanceof Node ? spriteOrNode.getComponent(Sprite) : spriteOrNode;

        let callback: Runnable = null;
        if (!bundle) {
            if (typeof cbOrBundle == 'string') {
                bundle = cbOrBundle;
            } else {
                callback = cbOrBundle;
            }
        } else {
            callback = cbOrBundle as Runnable;
        }

        loader.load(url, SpriteFrame, (err, asset: SpriteFrame) => {
            if (err) {
                console.warn(`ResourcesMgr-> updateSpriteFrame err: ${url}`);
                callback?.(null);
                return;
            }
            if (isValid(spriteOrNode, true)) {
                sprite.spriteFrame = asset;
                callback?.(asset);
            }

        }, bundle);
    }

    public loadPrefabAsset<Options, T extends tnt.GComponent<Options>>(loaderKeyAble: ILoaderKeyAble | tnt.AssetLoader | string, clazz: GConstructor<T> | string, options?: T['options']) {
        return new Promise<Prefab>((resolve, reject) => {
            let { loader, cls } = this._formatArgs(loaderKeyAble, clazz);

            let { prefabUrl, bundle } = this._parseAssetUrl(cls, options);
            loader.load(prefabUrl, Prefab, (err, assets) => {
                if (err) {
                    console.error(`UIMgr->加载预制体 [${prefabUrl}] 错误：`, err);
                    resolve(null);
                    return;
                }
                resolve(assets);
            }, bundle);
        });
    }

    public loadPrefabNode<Options, T extends tnt.GComponent<Options>>(loaderKeyAble: ILoaderKeyAble | tnt.AssetLoader | string, clazz: GConstructor<T> | string, options?: T['options']) {
        return new Promise<T>((resolve, reject) => {

            let { loader, cls } = this._formatArgs(loaderKeyAble, clazz);
            let { prefabUrl, bundle } = this._parseAssetUrl(cls, options);
            loader.load(prefabUrl, Prefab, (err, assets) => {
                if (err) {
                    console.error(`UIMgr->加载预制体 [${prefabUrl}] 错误：`, err);
                    resolve(null);
                    return;
                }
                let node = instantiate(assets);
                let component = node.getComponent(cls) || node.addComponent(cls);
                if (!component._loaderKey) {
                    component.loaderKey = loader.key;
                }
                component.bindNodes();
                component.updateOptions(options);
                component.onCreate();
                resolve(component);
            }, bundle);
        });
    }

    public addPrefabNode<Options, T extends tnt.GComponent<Options>>(loaderKeyAble: ILoaderKeyAble | tnt.AssetLoader | string, clazz: GConstructor<T> | string, parent: Node, options?: T['options']): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.loadPrefabNode(loaderKeyAble, clazz, options).then(component => {
                if (!component) {
                    resolve(null);
                    return;
                }
                if (parent?.isValid) {
                    component.node.parent = parent;
                }
                // component.onStart(); // 被 start 调用
                resolve(component);
            });
        })
    }



    public loadPrefabNodeSync<Options, T extends tnt.GComponent<Options>>(loaderKeyAble: ILoaderKeyAble | tnt.AssetLoader | string, clazz: GConstructor<T> | string, options?: T['options']): T {
        let { loader, cls } = this._formatArgs(loaderKeyAble, clazz);
        let { prefabUrl, bundle } = this._parseAssetUrl(cls, options);

        let assets = loader.getAsset(prefabUrl, Prefab, bundle);
        if (!assets) {
            return null;
        }
        let node = instantiate(assets.asset as Prefab);
        let component = node.getComponent(cls) || node.addComponent(cls);
        if (!component._loaderKey) {
            component.loaderKey = loader.key;
        }
        component.bindNodes();
        component.updateOptions(options);
        component.onCreate();
        return component;
    }

    public addPrefabNodeSync<Options, T extends tnt.GComponent<Options>>(loaderKeyAble: ILoaderKeyAble | tnt.AssetLoader | string, clazz: GConstructor<T> | string, parent: Node, options?: T['options']): T {
        let component = this.loadPrefabNodeSync(loaderKeyAble, clazz, options)
        if (!component) {
            return null;
        }
        component.node.parent = parent;
        return component;
    }

    /**
     * 释放单个资源
     *
     * @template T
     * @param {*} loaderKey
     * @param {string} path
     * @param {CCAssetType<T>} type
     * @memberof ResourcesMgr
     */
    public releaseAsset<T extends Asset>(loaderKey: any, path: string, type: CCAssetType<T>) {
        let loader = this._convertToLoader(loaderKey);
        loader.releaseAsset(path, type);
    }
    /**
     * 释放单个loader 中的引用
     * @param key 
     */
    public releaseLoader(key: any) {
        tnt.loaderMgr.releaseLoader(key);
    }

    /**
     * 释放所有的loader 的资源引用
     */
    public releaseAll() {
        tnt.loaderMgr.releaseAll();
    }

    public releaseBundle(bundle: string) {
        tnt.loaderMgr.releaseBundle(bundle);
    }


    /**
     *  注册加载二进制文件的解析
     *
     * @param {string} [ext]
     * @param {(file)=> any} [parserCallback]
     * @memberof ResourcesMgr
     */
    registerLoadBinary(ext?: string, parserCallback?: (file, options: Record<string, any>) => any) {
        tnt.AssetLoader.registerLoadBinary(ext, parserCallback);
    }

    private static _instance: ResourcesMgr = null;
    public static getInstance(): ResourcesMgr {
        if (!this._instance) {
            this._instance = new ResourcesMgr();
        }
        return this._instance;
    }
}

tnt.resourcesMgr = ResourcesMgr.getInstance();

export { };