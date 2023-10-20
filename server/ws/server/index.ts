
import * as ws from 'ws';
import path from 'path';
import { DEV } from './config';
import { net } from './framework/Net';
import { ProtoKeyTransformer, protoLoader } from './ProtoLoader';
const wss = new ws.Server({ port: 3000 });

import "./service";

declare type Constructor<T = unknown> = new (...args: any[]) => T;

@net.mgr()
class Main {

    //#region ---------- 装饰器自动注入 ----------

    declare handlerArray: Constructor[];
    declare sendFnMap: Map<string, INetSRObject>;
    declare recvFnMap: Map<string, INetSRObject>;

    //#endregion ---------- 装饰器自动注入 ----------
    // Handler 对象
    private _handlerObjectMap: Map<string, any> = new Map();

    launch() {
        this._initHandlerObjects();
        protoLoader.loadProto(path.join(__dirname, "cs.proto"), (root) => {
            this.startGame();
        });
    }

    startGame() {
        let self = this;
        wss.on('connection', function (ws) {
            // wss.clients.forEach((client)=>{
            //     client.send("连接");
            // });
            console.log(`[SERVER] connection()`);
            ws.on('message', async (message) => {
                // let msg = null;
                if (typeof message === 'string') {
                    // msg = JSON.parse(message);
                } else {
                    // 主包 解包
                    let Message = protoLoader.lookupType("cs.Pack");
                    let pack: cs.Pack = Message.decode(message);
                    let c2sId = pack.id;

                    let key = ProtoKeyTransformer.Ins.KeyFromC2SId(c2sId);

                    
                    // 二次解包
                    let MsgClass = protoLoader.lookupType(ProtoKeyTransformer.Ins.C2SNameFromKey(key));
                    let msg = MsgClass.decode(pack.data);
                    console.log(`C2S: ${key}#${c2sId} `,msg);


                    // 处理客户端的请求
                    let data = await self._clientRequest(key, msg);
                    // // 防止没有设置响应结果 code
                    // data.ret = data.ret ?? 1;

                    let s2cId = ProtoKeyTransformer.Ins.IdFromS2CKey(key);
                    console.log(`S2C: ${key}#${s2cId} `,data);
                    // 打包
                    {
                        let s2cName = ProtoKeyTransformer.Ins.S2CNameFromKey(key);
                        // 打包交互数据
                        let MsgClass = protoLoader.lookupType(s2cName);
                        let msg = MsgClass.encode(data);

                        // // 二次打包
                        let Message = protoLoader.lookupType("cs.Pack");
                        let pack = Message.encode({
                            id: s2cId,
                            data: msg,
                        });

                        ws.send(pack.toBuffer(), (err) => {
                            if (err) {
                                console.log(`[SERVER] error: ${err}`);
                            }
                        });
                    }
                }
                
            })
            ws.on("close", (ws) => {
                console.log(`[SERVER] ws close()`);
                wss.clients.forEach((client) => {
                    // client.send("下线了");
                });
            })
        });

        wss.on("close", function (ws) {
            console.log(`[SERVER] wss close()`);

        })

    }

    private _initHandlerObjects(){
        if(!this.handlerArray){
            return;
        }
        for (let i = 0; i < this.handlerArray.length; i++) {
            const clazz = this.handlerArray[i];
            // @ts-ignore
            this._handlerObjectMap.set(clazz.__net_tag_id__,new clazz());
        }
    }
    // // 注入的方法处理 发送的数据
    // private _sendData(key: string,req: any){
    //     if(!this.sendFnMap){
    //         return req;
    //     }
    //     let srObj = this.sendFnMap.get(key);
    //     if(srObj){
    //         let handlerObject = this._handlerObjectMap.get(srObj.targetTag);
    //         if(handlerObject){
    //             return handlerObject[srObj.sendFnName](req);
    //         }
    //         DEV && console.error(`HandlerMgr->send:  没有注册 ${srObj.targetTag} 类`);
    //         return req;
    //     }
    //     DEV && console.error(`HandlerMgr->send:  没有注册 ${key} 协议`);
    //     return req;
    // }

    // 注入的方法处理 客户端数据
    private async _clientRequest(key: string, response: any): Promise<any> {
        if (!this.recvFnMap) {
            return null;
        }
        let recvObj = this.recvFnMap.get(key);
        if (recvObj) {
            let handlerObject = this._handlerObjectMap.get(recvObj.targetTag);
            if (handlerObject) {
                return await handlerObject[recvObj.recvFnName](response);
            }
            DEV && console.error(`HandlerMgr->send:  没有注册 ${recvObj.targetTag} 类`);
            return null;
        }

        DEV && console.error(`HandlerMgr->send:  没有注册 ${key} 协议`);
    }
}


// serviceMgr.init();
new Main().launch();