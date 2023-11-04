
import { _decorator, Component, Node } from 'cc';
import { ProtoKeyTransformer } from './network/ProtoKeyTransformer';
import { protoLoader } from './protobuf/ProtoLoader';
import { NetListener } from './network/NetListener';
import { NetCodec } from './network/NetCodec';
import { HeartBeat } from './handlers/HeartBeat';
import { serverTimeHandler } from './handlers/ServerTimeHandler';


const { ccclass, property } = _decorator;


let idx = 10000;
@ccclass('WebSocketDemo')
export class WebSocketDemo extends tnt.SceneBase {

    protected onEnable(): void {

        // 加载 proto 文件
        protoLoader.loadAll("proto/single", null, () => {
            protoLoader.build("proto/single/cs.proto");
            this.onGameStart();
        });

        // tnt.netMgr.on("",()=>{},this);    

        tnt.netMgr.on("Bag_GetInfo", (res) => {
            res.items
            res.ob
            res.ret
        }, this)
    }

    onGameStart() {


    }

    protected onDisable(): void {
        tnt.netMgr.targetOff(this);
    }

    onEnterTransitionFinished(sceneName?: string): void {

        tnt.netMgr.initialize({
            serverUrl: `ws://localhost:3000/test/${++idx}`,
            heartbeat: new HeartBeat(),
            netListener: new NetListener(),
            codec: new NetCodec()
        });

        this.registerButtonClick("btnConnect", () => {
            tnt.netMgr.connect((res) => {
                if (res.isSuccess) {
                    console.log(`WebSocketDemo-> 连接  这里是游戏开始的登录`);
                    serverTimeHandler.enableSyncTime();
                }
            });

        });

        this.registerButtonClick("btnSend", () => {
            tnt.netMgr.send('User', {
                username: 123, password: "mima"
            }, (data) => {
                console.log(`WebSocketDemo-> `, data);
            });

            tnt.netMgr.send('Bag_GetInfo', {}, {
                onRecv(res) {

                },
                onError(errCode, err) {

                },
            });


        });
        this.registerButtonClick("btnClose", () => {
            // netMgr.close(netMgr.CloseCode.CLOSE_NORMAL,"xxx");
            tnt.netMgr.disconnect();
        });
    }

    onExitTransitionStart(sceneName?: string): void {

    }
}
