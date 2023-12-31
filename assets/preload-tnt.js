
// 在项目加载阶段 加载 框架Bundle
if (cc['settings']) {
    let _overrideAssets = cc['settings']?._override?.assets;
    let _settingsAssets = cc['settings']?._settings?.assets;
    let assets = _overrideAssets?.preloadBundles ? _overrideAssets : _settingsAssets;
    if (assets?.preloadBundles) {
        assets.preloadBundles = assets.preloadBundles.concat([{ bundle: "framework" }]);
    }

    if (CC_DEBUG) {
        cc.game.once(cc.Game.EVENT_POST_PROJECT_INIT, () => {
            cc.assetManager.loadBundle("cc-gui")
        })
    }
}