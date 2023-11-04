
import { _decorator } from 'cc';
import { DEV } from 'cc/env';

declare global {

    interface INetSRObject {
        target: any;
        targetTag: string;
        sendFnName?: string;
        recvFnName?: string;
    }

}

type MsgKeyType = string | number;

let _id = 1;

let handlerArray = [];
let sendFnMap: Map<MsgKeyType, INetSRObject> = new Map();
let recvFnMap: Map<MsgKeyType, INetSRObject> = new Map();
let isHasMgr = false;

function checkTag(target) {
    if (!target.constructor.__net_tag_id__) {
        target.constructor.__net_tag_id__ = `${_id}`;
        // _class_mapping[_id] = target.constructor;
        _id++;
    }
    return target.constructor.__net_tag_id__;
}

export const __net = {

    mgr() {
        return (target: any) => {
            if (isHasMgr) {
                console.log(`Net-> 已经注册过 net.mgr, 请勿重复注册！`);
                return;
            }
            isHasMgr = true;
            target.prototype.handlerArray = handlerArray;
            target.prototype.sendFnMap = sendFnMap;
            target.prototype.recvFnMap = recvFnMap;
        };
    },


    handler() {
        return (target: any) => {
            handlerArray.push(target);
        }
    },

    send(key: Keyof_ProtoType) {
        return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            // 收集发送协议 的对象和 方法


            let tag = checkTag(target);

            if (DEV) {
                if (sendFnMap.has(key)) {
                    let other = sendFnMap.get(key);

                    throw new Error(`已有同名 发送协议 ${key}, [${target.constructor.name}, ${other.target.constructor.name}], ${tag}`);
                }
            }
            sendFnMap.set(key, { targetTag: tag, sendFnName: propertyKey, target });
            return descriptor;
        }
    },

    recv(key: Keyof_ProtoType) {
        return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            // 收集接收协议的对象和方法

            let tag = checkTag(target);

            if (DEV) {
                if (recvFnMap.has(key)) {
                    let other = recvFnMap.get(key);
                    throw new Error(`已有同名 接收协议 ${key},[${target.constructor.name},${other.target.constructor.name}], ${tag}`);
                }
            }

            recvFnMap.set(key, { targetTag: tag, recvFnName: propertyKey, target });
            return descriptor;
        }
    },
}


// /**
//  * 全局声明扩展接口，添加 _net 对象
//  */
// declare global {
//     interface ITNT {
//         _net: typeof __net;
//     }
// }

// /**
//  * 将 __net 对象添加到全局 ITNT 接口中
//  */
// tnt._net = __net;


// export { };

// export namespace net {


//     let handlerArray = [];
//     let sendFnMap: Map<string, INetSRObject> = new Map();
//     let recvFnMap: Map<string, INetSRObject> = new Map();

//     // let _class_mapping: Record<number, INetSRObject> = {};

//     let isHasMgr = false;

//     function checkTag(target) {
//         if (!target.constructor.__net_tag_id__) {
//             target.constructor.__net_tag_id__ = `${_id}`;
//             // _class_mapping[_id] = target.constructor;
//             _id++;
//         }
//         return target.constructor.__net_tag_id__;
//     }

//      mgr() {
//         return (target: any) => {
//             if (isHasMgr) {
//                 console.log(`Net-> 已经注册过 net.mgr, 请勿重复注册！`);
//                 return;
//             }
//             isHasMgr = true;
//             target.prototype.handlerArray = handlerArray;
//             target.prototype.sendFnMap = sendFnMap;
//             target.prototype.recvFnMap = recvFnMap;
//         };
//     }


//      handler() {
//         return (target: any) => {
//             handlerArray.push(target);
//         }
//     }

//      send(key: Keyof_ProtoType) {
//         return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
//             // 收集发送协议 的对象和 方法


//             let tag = checkTag(target);

//             if (DEV) {
//                 if (sendFnMap.has(key)) {
//                     let other = sendFnMap.get(key);

//                     throw new Error(`已有同名 发送协议 ${key}, [${target.constructor.name}, ${other.target.constructor.name}], ${tag}`);
//                 }
//             }
//             sendFnMap.set(key, { targetTag: tag, sendFnName: propertyKey, target });
//             return descriptor;
//         }
//     }

//      recv(key: Keyof_ProtoType) {
//         return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
//             // 收集接收协议的对象和方法

//             let tag = checkTag(target);

//             if (DEV) {
//                 if (recvFnMap.has(key)) {
//                     let other = recvFnMap.get(key);
//                     throw new Error(`已有同名 接收协议 ${key},[${target.constructor.name},${other.target.constructor.name}], ${tag}`);
//                 }
//             }

//             recvFnMap.set(key, { targetTag: tag, recvFnName: propertyKey, target });
//             return descriptor;
//         }
//     }

// }
