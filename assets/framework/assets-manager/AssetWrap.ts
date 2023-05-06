import { Asset } from "cc";
import { BundleWrap } from "./BundleWrap";


export class AssetWrap {
    private _asset: Asset;
    public get asset(): Asset {
        return this._asset;
    }

    private _bundle: BundleWrap;
    public get bundle(): BundleWrap {
        return this._bundle;
    }

    private _refCount = 0;
    public get refCount() {
        return this._refCount;
    }
    private _path: string;
    public get path(): string {
        return this._path;
    }

    constructor(path: string, asset: Asset, bundle: BundleWrap) {
        this._path = path;
        this._bundle = bundle;
        bundle.addRef();
        asset.addRef();
        this._asset = asset;
    }

    public addRef() {
        this._refCount++;
    }

    public decRef() {
        this._refCount--;
        if (this._refCount <= 0) {
            this.destroy();
        }
    }


    public destroy() {

        this.asset.decRef();
        this.bundle.decRef();
    }
}