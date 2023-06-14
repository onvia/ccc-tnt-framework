
import { _decorator, Component, Node, Asset, path, sys, native } from 'cc';
import { IHotUpdateListener } from './_IHotUpdateDeclare';
const { ccclass, property } = _decorator;

export enum HotUpdateState {
    None = 0,
    Check = 1,
    Updating = 2,
}


@ccclass('HotUpdate')
export class HotUpdate {

    private manifestUrl: string = null;
    private listener: IHotUpdateListener = null;

    private assetsMgr: native.AssetsManager = null;
    private storagePath: string = '';
    private state: HotUpdateState = HotUpdateState.None;


    constructor(manifestUrl: string, listener: IHotUpdateListener) {
        this.manifestUrl = manifestUrl;
        this.listener = listener;
        this.storagePath = path.join(native.fileUtils ? native.fileUtils.getWritablePath() : '/', "HotUpdateRemote");
        this.assetsMgr = new native.AssetsManager(manifestUrl, this.storagePath, this.versionCompareHandle.bind(this));


        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this.assetsMgr.setVerifyCallback((path: string, asset: native.ManifestAsset) => {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;

            if (compressed) {
                //"Verification passed : " + relativePath;
                return true;
            }
            else {
                //"Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });

        if (sys.platform === sys.Platform.ANDROID) {
            // this.assetsMgr.setMaxConcurrentTask(5);
        }


        var localManifest = this.assetsMgr.getLocalManifest();
        console.log('【热更新】热更资源存放路径: ' + this.storagePath);
        console.log('【热更新】本地资源配置路径: ' + this.manifestUrl);
        console.log('【热更新】本地包地址: ' + localManifest.getPackageUrl());
        console.log('【热更新】远程 project.manifest 地址: ' + localManifest.getManifestFileUrl());
        console.log('【热更新】远程 version.manifest 地址: ' + localManifest.getVersionFileUrl());

    }



    checkUpdate() {

        if (this.assetsMgr.getState() === native.AssetsManager.State.UNINITED) {
            console.error(`【热更新】未初始化`);
            return;
        }
        let localManifest = this.assetsMgr.getLocalManifest();
        if (!localManifest || !localManifest.isLoaded()) {
            // 读取本地配置失败
            console.log('【热更新】加载本地 manifest 失败 ...');
            return;
        }

        this.assetsMgr.setEventCallback(this._onCheckUpdateCallback.bind(this));
        this.state = HotUpdateState.Check;
        this.assetsMgr.checkUpdate();

    }

    startHotUpdate() {
        this.assetsMgr.setEventCallback(this._onHotUpdateCallback.bind(this));
        this.state = HotUpdateState.Updating;
        this.assetsMgr.update();
    }

    private _onCheckUpdateCallback(event: native.EventAssetsManager) {
        console.log('Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                // No local manifest file found, hot update skipped.
                console.log("【热更新】未找到清单文件，跳过更新");
                this.listener.onSkipUpdate(event);
                break;
            case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
                // Fail to download manifest file, hot update skipped.
                console.log("【热更新】下载清单文件失败，跳过更新");
                this.listener.onSkipUpdate(event);
                break;
            case native.EventAssetsManager.ALREADY_UP_TO_DATE:
                // Already up to date with the latest remote version.
                console.log("【热更新】当前版本与远程版本一致且无须更新");
                this.listener.onAlreadyLatestVersion();
                break;
            case native.EventAssetsManager.NEW_VERSION_FOUND:
                // 'New version found, please try to update. (' + Math.ceil(this.assetsMgr.getTotalBytes() / 1024) + 'kb)'
                console.log('【热更新】发现新版本,请更新');
                this.listener.onFindedNewVersion(this.assetsMgr.getTotalBytes());
                break;
            default:
                return;
        }

        this.assetsMgr.setEventCallback(null);
    }

    private _onHotUpdateCallback(event: native.EventAssetsManager) {
        let code = event.getEventCode();
        switch (code) {
            case native.EventAssetsManager.ASSET_UPDATED:
                console.log('【热更新】资产更新');
                break;
            case native.EventAssetsManager.UPDATE_PROGRESSION:
                if (this.state === HotUpdateState.Updating) {
                    // event.getPercent();
                    // event.getPercentByFile();
                    // event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                    // event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
                    console.log('【热更新】更新中...', event.getDownloadedFiles(), event.getTotalFiles(), event.getPercent());
                    this.listener.onUpdateProgress(event);
                }
                break;
            case native.EventAssetsManager.UPDATE_FINISHED:
                this._onUpdateFinished();
                break;

            case native.EventAssetsManager.UPDATE_FAILED:
            case native.EventAssetsManager.ERROR_UPDATING:
            case native.EventAssetsManager.ERROR_DECOMPRESS:
                this._onUpdateFailed(event);
                break;
            default:
                break;
        }

    }


    private _onUpdateFinished() {
        this.assetsMgr.setEventCallback(null);

        var searchPaths = native.fileUtils.getSearchPaths();
        var newPaths = this.assetsMgr.getLocalManifest().getSearchPaths();

        console.log(`SearchPaths: ${JSON.stringify(newPaths)}`);

        Array.prototype.unshift.apply(searchPaths, newPaths);
        // This value will be retrieved and appended to the default search path during game startup,
        // please refer to samples/js-tests/main.js for detailed usage.
        // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
        localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        native.fileUtils.setSearchPaths(searchPaths);


        console.log('【热更新】更新成功');
        this.listener.onUpdateSucceed();
    }

    private _onUpdateFailed(event: native.EventAssetsManager) {
        this.assetsMgr.setEventCallback(null);

        console.log('【热更新】更新失败');
        this.listener.onUpdateFailed(event);
    }


    private versionCompareHandle(versionA: string, versionB: string): number {
        console.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);

        this.listener.onVersionInfo(versionA, versionB);

        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || '0');
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    }


    private showSearchPath() {
        console.log("========================搜索路径========================");
        let searchPaths = native.fileUtils.getSearchPaths();
        for (let i = 0; i < searchPaths.length; i++) {
            console.log("[" + i + "]: " + searchPaths[i]);
        }
        console.log("======================================================");
    }
}