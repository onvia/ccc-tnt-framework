import { collectionHandlers } from "./collections"
import { baseHandlers } from "./base"
import { Key, Raw, ReactiveProxy } from "../../types/_types"
import { hasOwnProperty, proxyToRaw } from "../internals";

const arrayHandler = {
  push() {
    let oldValue = this.slice();

    const target = proxyToRaw.get(this)
    const proto: any = Reflect.getPrototypeOf(this)
    // 求出结果
    const result = proto.push.apply(target, arguments)
    console.log(`collections->push `, result, "oldValue", oldValue, "newValue", target);

    return result
  }
}

// 真正交给Proxy第二个参数的handlers只有一个get
// 把用户对于map的get、set这些api的访问全部移交给上面的劫持函数
export const collectionHandlers111 = {
  get(target: Raw, key: Key, receiver: ReactiveProxy) {
    // 返回上面被劫持的api
    // target = hasOwnProperty.call(arrayHandler, key)
    //   ? arrayHandler
    //   : target
    // return Reflect.get(target, key, receiver)

    if (hasOwnProperty.call(arrayHandler, key)) {
      return Reflect.get(arrayHandler, key, receiver)
    }
    return baseHandlers.get(target, key, receiver);
  },

  set: baseHandlers.set,
  ownKeys: baseHandlers.ownKeys,
  deleteProperty: baseHandlers.deleteProperty,
}

// @ts-ignore
// 根据对象的类型 获取Proxy的handlers
export const handlers = new Map([
  [Map, collectionHandlers],
  [Set, collectionHandlers],
  [WeakMap, collectionHandlers],
  [WeakSet, collectionHandlers],
  [Object, baseHandlers],
  [Array, collectionHandlers111],
  [Int8Array, baseHandlers],
  [Uint8Array, baseHandlers],
  [Uint8ClampedArray, baseHandlers],
  [Int16Array, baseHandlers],
  [Uint16Array, baseHandlers],
  [Int32Array, baseHandlers],
  [Uint32Array, baseHandlers],
  [Float32Array, baseHandlers],
  [Float64Array, baseHandlers],
])

/** 获取Proxy的handlers */
export function getHandlers(obj: Raw) {
  // @ts-ignore
  return handlers.get(obj.constructor)
}
