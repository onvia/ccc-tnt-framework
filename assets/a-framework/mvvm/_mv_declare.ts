import { CCObject, ValueType, Node, SpriteFrame, Sprite, Label, RichText, Component } from "cc";
import { VMBaseHandler } from "./handlers/VMBaseHandler";

export type ForOpType = "init" | "add" | "delete" | "refresh";
export type WatchPath = string | string[];
export type BaseValueType = string[] | string | number | number[];
export type ReturnValueType = BaseValueType | boolean | CCObject | ValueType | object;

export type FormatterOpts = { handler: VMBaseHandler, newValue: any, oldValue?: any, node?: Node, /*nodeIdx?: number,*/ watchPath?: WatchPath, readonly attr?: VMBaseAttr, component?: Component };
export type Formatter<T, E> = (options: FormatterOpts & E) => T | Promise<T> | T[] | Promise<T[]>;
export type DataChanged = (options: { handler: VMBaseHandler, newValue: any, oldValue?: any, watchPath?: WatchPath, readonly attr?: VMBaseAttr, component?: Component }) => void;
export interface IVMItem {
    updateItem(data, index, ...args);
}
// 观察属性选项
export interface VMBaseAttr<R = any> {
    /**
     * 处理数据类，不需要手动设置
     * @type {string}
     * @memberof VMBaseAttr
     */
    _handler?: string;
    /**
     * 目标属性，不需要手动设置
     * @type {string}
     * @memberof VMBaseAttr
     */
    _targetPropertyKey?: string;

    /**
     * 是否双向绑定
     *
     * @type {boolean}
     * @memberof VMBaseAttr
     */
    isBidirectional?: boolean;
    watchPath: WatchPath;
    tween?: IVMTween | boolean | number;
    formatter?: Formatter<R, unknown>;
    /** 数据发生改变 */
    onValueChange?: DataChanged;
}

export interface VMCustomAttr<R> extends VMBaseAttr<R> {

    bundle?: string;

    loaderKey?: string;

}

// 观察属性选项
export interface VMForAttr extends VMBaseAttr {
    component: GConstructor<tnt.UIBase & IVMItem>;

    /** @deprecated 在 VMForAttr 中不要使用这个属性 */
    tween?: null;

    /** @deprecated 在 VMForAttr 中不要使用这个属性 */
    formatter?: null;

    isBidirectional?: false;

    /** 数据发生改变 */
    onChange: (operate: ForOpType) => void;
}

export interface VMSkinAttr<R> extends VMCustomAttr<R> {

    /** @deprecated 在 VMSpriteAttr 中不要使用这个属性*/
    tween?: null;

    formatter?: Formatter<R, { bundle?: string, loaderKey?: string }>;
}

export interface VMLabelAttr<R> extends VMCustomAttr<R> {
    /**
     * 最大字符串长度
     * */
    maxLength?: number;
}

export interface VMEventAttr extends VMBaseAttr {

    /** @deprecated 在 VMEventAttr 中不要使用这个属性 */
    tween?: null;

    /** @deprecated 在 VMEventAttr 中不要使用这个属性 */
    formatter?: null;

}


// 约束返回值类型，如果返回值类型是 字符串，则可以返回 数值、字符串以及 数值数组、字符串数组
type BaseValueTypeOrOriginal<T> = T extends string ? number | number[] | string | string[] : T;

// // 属性绑定
// export type BaseAttrBind<T> = {
//     [P in keyof T]?: WatchPath | VMBaseAttr<BaseValueTypeOrOriginal<T[P]>>;
// }

// 属性绑定
export type CustomAttrBind<T> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? never : P]?: WatchPath | VMCustomAttr<BaseValueTypeOrOriginal<T[P]>>;
}

// 属性绑定
export type SkinAttrBind<T> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? never : P]?: WatchPath | VMSkinAttr<BaseValueTypeOrOriginal<T[P]>>;
}

// 属性绑定
export type LabelAttrBind<T = Label | RichText> = {
    [P in keyof T as T[P] extends (...args: any[]) => any ? never : P]?: WatchPath | VMLabelAttr<BaseValueTypeOrOriginal<T[P]>>;
}