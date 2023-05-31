import { CCObject, ValueType, Node, SpriteFrame, Sprite, Label, RichText } from "cc";
import { VMBaseHandler } from "./handlers/VMBaseHandler";
import { TriggerOpTypes } from "./VMOperations";

export type WatchPath = string | string[];
export type ReturnValue = string | number | boolean | CCObject | ValueType | object;

export type FormatorOpts = { trigger: VMBaseHandler, newValue: any, oldValue?: any, node?: Node, nodeIdx?: number, watchPath?: WatchPath };
export type FormatorSpriteOpts = { trigger: VMBaseHandler, newValue: any, oldValue?: any, node?: Node, nodeIdx?: number, watchPath?: WatchPath, bundle?: string, loaderKey?: string };
export type Formator<T, E> = (options: FormatorOpts & E) => T | Promise<T> | T[] | Promise<T[]>;
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
    isBidirection?: boolean;
    watchPath: WatchPath;
    tween?: IVMTween;
    formator?: Formator<R, unknown>;
}

// 观察属性选项
export interface VMForAttr extends VMBaseAttr {
    component: GConstructor<tnt.UIBase & IVMItem>;

    /** @deprecated 在 VMForAttr 中不要使用这个属性*/
    tween?: null;

    /** @deprecated 在 VMForAttr 中不要使用这个属性 */
    formator?: null;

    /** 数据发生改变 */
    onChange: (operate: TriggerOpTypes) => void;
}

export interface VMSpriteAttr<R> extends VMBaseAttr<R> {

    bundle?: string;

    loaderKey?: string;

    /** @deprecated 在 VMSpriteAttr 中不要使用这个属性*/
    tween?: null;

    formator?: Formator<R, { bundle?: string, loaderKey?: string }>;
}

export interface VMLabelAttr<R> extends VMBaseAttr<R> {
    /**
     * 最大字符串长度
     * */ 
    maxLength?: number;
}


// 属性绑定
export type BaseAttrBind<T> = {
    [P in keyof T]?: WatchPath | VMBaseAttr<T[P]>;
}

// 属性绑定
export type SpriteAttrBind<T = Sprite> = {
    [P in keyof T]?: WatchPath | VMSpriteAttr<T[P]>;
};

// 属性绑定
export type LabelAttrBind<T = Label | RichText> = {
    [P in keyof T]?: WatchPath | VMLabelAttr<T[P]>;
};