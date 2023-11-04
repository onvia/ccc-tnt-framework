import { MsgID } from "./MsgID";

export class ProtoKeyTransformer {


    private getBaseName(key: INetMsgKeyType) {
        if (typeof key === 'string') {
            let idx = key.indexOf(".");
            let name = "";
            if (idx != -1) {
                name = key.substring(idx + 1, key.length);
            } else {
                name = key;
            }
            return name;
        }
        return key;
    }
    S2CKeyConvertToID(key: INetMsgKeyType): number {
        let name = this.getBaseName(key);
        let _key = `ID_S2C_${name}`;
        return MsgID[_key];
    }
    C2SKeyConvertToID(key: INetMsgKeyType): number {
        let name = this.getBaseName(key);
        let _key = `ID_C2S_${name}`;
        return MsgID[_key];
    }
    IDConvertToC2SKey(id: number): string {
        let enumName = MsgID[id];
        let key = enumName.replace("ID_C2S_", "");
        return key;
    }
    IDConvertToS2CKey(id: number): INetMsgKeyType {

        let enumName = MsgID[id];
        let key = enumName.replace("ID_S2C_", "");
        return key;
    }
    C2SKeyConvertToName(key: INetMsgKeyType): string {
        return `cs.C2S_${key}`;
    }
    S2CKeyConvertToName(key: INetMsgKeyType): string {
        return `cs.S2C_${key}`;
    }

    private static _instance: ProtoKeyTransformer = null
    public static get Ins(): ProtoKeyTransformer {
        if (!this._instance) {
            this._instance = new ProtoKeyTransformer();
        }
        return this._instance;
    }
}