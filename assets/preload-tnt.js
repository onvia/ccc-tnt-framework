
// 在项目加载阶段 加载 框架Bundle
if (cc['settings']) {
    let _overrideAssets = cc['settings']?._override?.assets;
    let _settingsAssets = cc['settings']?._settings?.assets;
    let assets = _overrideAssets?.preloadBundles ? _overrideAssets : _settingsAssets;
    if (assets?.preloadBundles) {
        assets.preloadBundles = assets.preloadBundles.concat([{ bundle: "framework" }]);
    }
}


