
import { $ProtoBuf as ProtoBuf } from './libs/protobuf/ProtoBuf';
import { MsgID } from './MsgID';
type Message = typeof ProtoBuf.Message;

// // 编码
// engine.netMgr.flows.encodeDataFlow.push((opt)=>{
//     // 打包交互数据
//     let MsgClass = protoLoader.lookupType(ProtoKeyTransformer.Ins.C2SNameFromKey(opt.key));
//     let msg = MsgClass.encode(opt.data);

//     // 二次打包
//     let Message = protoLoader.lookupType("cs.Pack");
//     let pack = Message.encode({
//         id: opt.c2sId, 
//         data: msg,
//     });
//     opt.data = pack;
//     return opt;
// });
 
export class ProtoKeyTransformer{
    private getBaseName(key: string){
        let idx = key.indexOf(".");
        let name = "";
        if(idx != -1){
            name = key.substring(idx + 1,key.length);
        }else{
            name = key;
        }
        return name;
    }
    IdFromS2CKey(key: string): number {
        let name = this.getBaseName(key);
        let _key = `ID_S2C_${name}`; 
        return MsgID[_key];
    }
    IdFromC2SKey(key: string): number {
        let name = this.getBaseName(key);
        let _key = `ID_C2S_${name}`; 
        return MsgID[_key];
    }
    KeyFromC2SId(id: number): string {
        let enumName = MsgID[id];
        let key = enumName.replace("ID_C2S_","");
        return key;
    }
    KeyFromS2CId(id: number): string {
        
        let enumName = MsgID[id];
        let key = enumName.replace("ID_S2C_","");
        return key;
    }
    C2SNameFromKey(key: string): string {
        return `cs.C2S_${key}`;
    }
    S2CNameFromKey(key: string): string {
        return `cs.S2C_${key}`;
    }

    private static _instance: ProtoKeyTransformer = null
    public static get Ins(): ProtoKeyTransformer{
        if(!this._instance){
            this._instance = new ProtoKeyTransformer();
        }
        return this._instance;
    }
}
export class ProtoLoader{

    declare root;

    public loadProto(file,callback: (... args)=> void) {
        ProtoBuf.loadProtoFile(file, (err, builder) => {
            if(err){
                console.log(`ProtoLoader->load err `,err);
                return;
            }
            this.root = builder.build();
            callback?.(this.root);
        });
    }
    public lookupType(path: string): Message{
        return this._lookup(path);
    }

    private _lookup (path: string): Message{
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

export const protoLoader = ProtoLoader.getInstance();