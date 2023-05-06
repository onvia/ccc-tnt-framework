import { Asset, AssetManager, js, JsonAsset, SpriteFrame, warn } from "cc";


export let bootstrapOptions: IBootstrapOptions = {

    debug: true,

    
    defaultBtnSound: "click",
    soundConfig: {
        
    },


    i18nConfig: {
        language: "zh",
        load<T extends Asset>(path: string, type: CCAssetType<T>, bundle: string | AssetManager.Bundle): Promise<T> {
            return new Promise<T>((resolve, reject) => {
                let loader: tnt.AssetLoader = null;
                if (js.getClassName(type) === js.getClassName(JsonAsset)) {
                    // 要加载新的 多语言文本
                    loader = tnt.loaderMgr.get('i18n');
                    // 释放现有的数据
                    loader.releaseAll();
                } else {
                    loader = tnt.loaderMgr.scene;
                }
                loader.load(path, type, (err, asset) => {
                    err && warn(`i18n-> `, err);
                    resolve(asset);
                }, bundle);
            })
        },
        releaseBundle: (bundle) => {
            let loader: tnt.AssetLoader = tnt.loaderMgr.scene;
            loader.releaseBundle(bundle);
        }
    },
}
