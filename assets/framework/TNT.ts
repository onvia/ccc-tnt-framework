

import { profiler, EffectAsset, game, Game } from "cc";

declare global {

    interface ITbl { }
    interface IGame { }
    interface IUtils { }

    interface ITNT {
        options: IBootstrapOptions;

        /**表格全局 */
        tbl: ITbl;

        /**游戏业务全局 */
        game: IGame;

        /** 工具全局 */
        utils: IUtils;

        bootstrap(options?: IBootstrapOptions);
        enableTimer();
    }

    const tnt: ITNT;

    interface IBootstrapOptions {
        debug?: boolean;
        audioConfig?: AudioMgrOptions;
        i18nConfig: I18NConfig;
        defaultBtnSound?: string;

        /** 音效配置，键名为 节点名 */
        soundConfig?: { [k in string]: string };
    }
}


tnt.bootstrap = (options?: IBootstrapOptions) => {
    tnt.options = options;
    tnt.audioMgr.init(options?.audioConfig);
    tnt.i18n.init(options.i18nConfig);
    tnt._decorator._registePlugins();
    options.debug && profiler.showStats();

    // 加载内置 EffectAsset
    tnt.loaderMgr.share.loadDir("framework#resources/shader/effect", EffectAsset, (err, assets) => {
        if (err) {
            console.warn(`TNT-> 加载内置 EffectAsset 错误。 `, err);
            return;
        }
        assets.forEach((asset) => {
            EffectAsset.register(asset);
        });
    });
}
export { };