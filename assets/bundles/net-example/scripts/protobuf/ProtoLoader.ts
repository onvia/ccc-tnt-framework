
import { _decorator, Component, Node, Asset, TextAsset, js, misc, path } from 'cc';
import { $ProtoBuf as ProtoBuf } from './ProtoBuf';
const { ccclass, property } = _decorator;


type TMessage = typeof ProtoBuf.Message;

let cache = {};
// 对 fetch 进行劫持
ProtoBuf.Util.fetch = (_path: string, callback?: Runnable)=>{   
    let basename = path.basename(_path);
    let filename = basename.split('.')[0];    
     callback?.(cache[filename]);
     return cache[filename];
}


@ccclass('ProtoLoader')
export class ProtoLoader {

    root: any = null;

    get loader(): tnt.AssetLoader{
        return tnt.loaderMgr.get("proto");
    };

    public loadAll(dir: string,_onProgress?: CCProgressCallback, _onComplete?: CCCompleteCallbackWithData<TextAsset[]>) {
        this.loader.loadDir(dir,TextAsset,(finish,total,item)=>{
            _onProgress?.(finish,total,item);
        },(err,assets)=>{
            assets.forEach((asset)=>{                
                cache[asset.name] = asset;
            });
            _onComplete(err,assets);
        });
    }

    public build(main: string){
        let basename = path.basename(main);
        let filename = basename.split('.')[0];
        let builder = ProtoBuf.loadProto(cache[filename], main);
        this.root = builder.build();
        return this.root;
    }

    public lookupType(path: string): TMessage{
        return this._lookup(path);
    }

    private _lookup (path: string): TMessage{
        let paths = path.split(".");
        let cur = this.root;

        while (paths.length && cur) {
            cur = cur[paths.shift()];
        }

        return cur;
    }

    private static _instance: ProtoLoader = null
    public static getInstance(): ProtoLoader{
        if(!this._instance){
            this._instance = new ProtoLoader();
        }
        return this._instance;
    }
}


export const protoLoader: ProtoLoader = ProtoLoader.getInstance();