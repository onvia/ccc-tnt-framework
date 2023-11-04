
import { _decorator, Component, Node } from 'cc';
import { ProtoKeyTransformer } from './ProtoKeyTransformer';
import { protoLoader } from '../protobuf/ProtoLoader';
const { ccclass, property } = _decorator;


@ccclass('NetCodec')
export class NetCodec implements INetCodec {


    // 编码
    encode(opt: INetEncode) {
        // 打包交互数据
        let MsgClass = protoLoader.lookupType(ProtoKeyTransformer.Ins.C2SKeyConvertToName(opt.key));
        let msg = MsgClass.encode(opt.data);

        let c2sId = ProtoKeyTransformer.Ins.C2SKeyConvertToID(opt.key)

        // 二次打包
        let Message = protoLoader.lookupType("cs.Pack");
        let pack = Message.encode({
            id: c2sId,
            data: msg,
        });
        opt.data = pack.toBuffer();
        return opt;
    }
    // 解码
    decode(data: INetData, callback: (pack: INetDecode) => void) {
        // 主包解包
        let Message = protoLoader.lookupType("cs.Pack");
        let csPack: cs.Pack = Message.decode(data);

        let key = ProtoKeyTransformer.Ins.IDConvertToS2CKey(csPack.id);
        // 二次解包
        let MsgClass = protoLoader.lookupType(ProtoKeyTransformer.Ins.S2CKeyConvertToName(key));
        let msg = MsgClass.decode(csPack.data);

        let pack: INetDecode = {
            data: msg,
            key: key,
            errCode: msg.ret ?? 1,
            isSuccess: msg.ret <= 0 ? false : true,
        }
        callback(pack);
    }

}