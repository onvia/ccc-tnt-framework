
import { _decorator, Component, Node, Asset, AssetManager } from 'cc';
import { TaskQueue } from './TaskQueue';
const { ccclass, property } = _decorator;


declare global {
    interface ILoadingListener {
        onLoadAssetComplete(error, asset: Asset | Asset[], path: string);
        onLoadAllComplete();
    }
}
@ccclass('LoadingTask')
export class LoadingTaskQueue extends TaskQueue {

    private _loaderKey = '';
    private _duration = 2;
    private _onLoadingListener: ILoadingListener;
    private _isLoading = false;
    private _visualCount = 0;

    public addAsset<T extends Asset>(path: string, type: CCAssetType<T>, bundle?: AssetManager.Bundle | string) {
        this.addTask((progress, done) => {
            let loader = tnt.loaderMgr.get(this._loaderKey);
            loader.load(path, type, (finish: number, total: number, item) => {
                progress(finish / total);
            }, (err, asset) => {
                this.onComplete(err, asset, path);
                done();
            }, bundle);
        });
    }

    public addArray<T extends Asset>(paths: string[], type: CCAssetType<T>, bundle?: AssetManager.Bundle | string) {
        this.addTask((progress, done) => {
            let loader = tnt.loaderMgr.get(this._loaderKey);
            loader.loadArray(paths, type, (finish: number, total: number, item) => {
                progress(finish / total);
            }, (err, asset) => {
                this.onComplete(err, asset, paths);
                done();
            }, bundle);
        });
    }

    public addDir<T extends Asset>(dir: string, type: CCAssetType<T>, bundle?: AssetManager.Bundle | string) {
        this.addTask((progress, done) => {
            let loader = tnt.loaderMgr.get(this._loaderKey);
            loader.loadDir(dir, type, (finish: number, total: number, item) => {
                progress(finish / total);
            }, (err, asset) => {
                this.onComplete(err, asset, dir);
                done();
            }, bundle);
        });
    }

    public addBundle(name: string) {
        this.addTask((progress, done) => {
            let loader = tnt.loaderMgr.get(this._loaderKey);
            loader.loadBundle(name, (err, asset) => {
                this.onComplete(err, asset, name);
                done();
            });
        });
    }

    private onComplete(error, assets, path) {
        if (!this.tasks.length) {
            return;
        }
        this._onLoadingListener?.onLoadAssetComplete(error, assets, path);
    }
    public startTask(loaderKey: string, onLoadingListener: ILoadingListener, duration: number) {
        this._loaderKey = loaderKey;
        this._onLoadingListener = onLoadingListener;
        this._duration = duration;
        this._isLoading = true;
        this.startTasksParallel(() => {
            this._onLoadingListener.onLoadAllComplete();
        });
    }

    public step(dt: number) {
        if (this._isLoading) {
            let unit = this._duration / dt;
            let rdt = this.totalTaskCount / unit;

            this._visualCount = Math.min(this._visualCount + rdt, this.completedCount)

        }
        let progress = this._visualCount * 1.0 / this.totalTaskCount;

        if (isNaN(progress)) {
            progress = 0;
        }
        return progress;
    }
}
