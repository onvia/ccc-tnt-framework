import { AssetManager } from "cc";

type Bundle = AssetManager.Bundle;
export class BundleWrap {
    private _bundle: Bundle;
    public get bundle(): Bundle {
        return this._bundle;
    }
    private _refCount = 0;
    public get refCount() {
        return this._refCount;
    }
    private _name: string;
    public get name(): string {
        return this._name;
    }
    constructor(name: string, bundle: Bundle) {
        this._name = name;
        this._bundle = bundle;
    }

    public addRef() {
        this._refCount++;
    }

    public decRef() {
        this._refCount--;
        if (this._refCount <= 0 && tnt.AssetLoader.autoReleaseBundle) {
            this.destroy();
        }
    }
    protected destroy() {
        tnt.AssetLoader.removeBundle(this.name);
    }
}
