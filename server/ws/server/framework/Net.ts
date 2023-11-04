

/**
 * Predefined variables
 * Name = Net
 * DateTime = Sat Oct 22 2022 09:16:58 GMT+0800 (中国标准时间)
 * Author = 272493431
 * FileBasename = Net.ts
 * FileBasenameNoExtension = Net
 * URL = db://assets/scripts/framework/network/Net.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

import { DEV } from "../config";

declare global{
    
    interface INetSRObject{
        targetTag: string;
        sendFnName?: string;
        recvFnName?: string;
    }
}


let _id = 1;
export namespace net{
    
    
    let handlerArray = [];
    let sendFnMap: Map<string,INetSRObject> = new Map();
    let recvFnMap: Map<string,INetSRObject> = new Map();

    let _class_mipmaping: Record<number,INetSRObject>= {};

    let isHasMgr = false;

    function checkTag(target){
        if(!target.constructor.__net_tag_id__){
            target.constructor.__net_tag_id__ = `${_id}`;
            _class_mipmaping[_id] = target.constructor;
            _id++;
        }
        return target.constructor.__net_tag_id__;
    }
    
    export function mgr(){
        return (target: any) => {
            if(isHasMgr){
                console.log(`Net-> 已经注册过 net.mgr, 请勿重复注册！`);
                return;
            }
            isHasMgr = true;
            target.prototype.handlerArray = handlerArray;
            target.prototype.sendFnMap = sendFnMap;
            target.prototype.recvFnMap = recvFnMap;
        };
    }
    
    
    export function handler(){
        return (target: any) => {
            handlerArray.push(target);             
            console.log(`Net-> ${target.name} ${handlerArray.length}`);
            
        }
    }

    // 响应客户端的请求
    export function apiResponse(key: Keyof_ProtoType){
        return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            // 收集发送协议 的对象和 方法

            let tag = checkTag(target);

            if(DEV){
                if(sendFnMap.has(key)){
                    throw new Error(`已有同名 发送协议 ${key},${target.constructor.name}, ${tag}`);
                }
            }
            sendFnMap.set(key,{targetTag: tag,sendFnName: propertyKey});
            return descriptor;
        }
    }

    // 接收客户端的请求
    export function apiRequest(key: Keyof_ProtoType){
        return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            // 收集接收协议的对象和方法
          
            let tag = checkTag(target);

            if(DEV){
                if(recvFnMap.has(key)){
                    throw new Error(`已有同名 接收协议 ${key},${target.constructor.name}, ${tag}`);
                }
            }

            recvFnMap.set(key,{targetTag: tag,recvFnName: propertyKey});
            return descriptor;
        }
    }

}
