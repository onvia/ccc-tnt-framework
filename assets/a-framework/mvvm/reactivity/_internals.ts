import { Component, Node } from "cc";
import { VMBaseHandler } from "../handlers/VMBaseHandler";

// 需要定义响应式的原值
export type Raw = object

// 定义成响应式后的proxy
export type ReactiveProxy = object


export const mvMap: Map<string, { data: object, tag: string }> = new Map();

// 缓存代理
export const proxyMap = new WeakMap<Raw, ReactiveProxy>();

// 通过代理查找原始数据
export const rawMap = new WeakMap<ReactiveProxy, Raw>();

// 数据依赖
export const rawDepsMap = new WeakMap<Raw, Raw>();
// 数据对象名称
export const rawNameMap = new WeakMap<Raw, PropertyKey>();  // value 为数据名称
// export const targetMap = new WeakMap<Raw, Set<Component | Node>>();
export const targetMap = new Map<string, Set<Component | Node>>();
export const handlerMap = new WeakMap<Component | Node, Array<VMBaseHandler<any>>>();
export const unbindMap = new WeakMap<IMVVMObject, IVMObserveAutoUnbind>();

export const enum RawType {
    INVALID = 0,
    COMMON = 1,
    COLLECTION = 2
}

export const enum TriggerOpTypes {
    SET = 'set',
    ADD = 'add',
    DELETE = 'delete',
    CLEAR = 'clear'
}

export interface IVMObserveAutoUnbind {
    removeComponent(comp: Component);
    nodeDestroyed();
    unbind();
}


export { };