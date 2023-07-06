

import { profiler, EffectAsset, game } from "cc";

declare global {

    interface ITbl { }
    interface IGame { }
    interface IUtils { }
    interface ITiled { }

    interface ITNT {
        options: IStartupOptions;

        /**表格全局 */
        tbl: ITbl;

        /**游戏业务全局 */
        game: IGame;

        /** 工具全局 */
        utils: IUtils;

        /** TiledMap */
        tiled: ITiled;

        startup(options?: IStartupOptions);
        enableTimer();


        /** TNT 框架初始化完成事件 */
        readonly EVENT_TNT_INITED;

        /** 框架启动 */
        readonly EVENT_TNT_STARTUP;
    }

    const tnt: ITNT;

    interface IStartupOptions {
        debug?: boolean;
        audioConfig?: AudioMgrOptions;
        i18nConfig: I18NConfig;
        defaultBtnSound?: string;

        /** 音效配置，键名为 节点名 */
        soundConfig?: { [k in string]: string };
    }
}

tnt.startup = (options?: IStartupOptions) => {
    tnt.options = options;
    tnt.audioMgr.init(options?.audioConfig);
    tnt.i18n.init(options.i18nConfig);
    tnt._decorator._registePlugins();
    options.debug && profiler.showStats();
    
    game.emit(tnt.EVENT_TNT_STARTUP);
    tnt.eventMgr.emit(tnt.EVENT_TNT_STARTUP);
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