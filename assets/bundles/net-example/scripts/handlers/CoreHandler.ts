
import { _decorator, Component, Node } from 'cc';
const  { handler,send, recv } = tnt._decorator._net;
const { ccclass, property } = _decorator;

@handler()
@ccclass('CoreHandler')
export class CoreHandler implements cs.UserHandler {

   	@send("User")
    sendUser(data: cs.C2S_User): cs.C2S_User{
        console.log(`CoreHandler-> `,data);
        return data;
    }
    
    @recv("User")
    recvUser(data: cs.S2C_User){
        console.log(`CoreHandler-> `,data);
    }
    
}
