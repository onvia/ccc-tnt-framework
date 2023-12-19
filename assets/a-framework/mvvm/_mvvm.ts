import { Component, Label, Node, Sprite, EditBox, ProgressBar, RichText, Slider, Toggle, UIOpacity, UIRenderer, js, UITransform, SpriteFrame, Button, sp, Color, Size, Asset, Renderer, instantiate } from "cc";
import { DEBUG, DEV } from "cc/env";
import { GVMTween } from "./VMTween";
import { isArray } from "./VMGeneral";
import { VMBaseAttr, WatchPath, Formatter, ReturnValueType, VMForAttr, SkinAttrBind, LabelAttrBind, BaseValueType, VMEventAttr, DataChanged, CustomAttrBind, VMCustomAttr } from "./_mv_declare";
import * as VMFactory from "./VMFactory";
import { VMHandlerName } from "./VMFactory";
import { handlerMap, IVMObserveAutoUnbind, proxyMap, Raw, rawDepsMap, rawMap, rawNameMap, targetMap, unbindMap } from "./reactivity/_internals";
import { _reactive } from "./reactivity/_reactive";
import { VMBaseHandler } from "./handlers/VMBaseHandler";
import { formatAttr, parseWatchPath, registerDefaultComponentProperty, registerDefaultFormatter } from "./_common";



declare global {
    interface IMVVMObject {
        _vmTag?: string;
        loaderKey?: any;
        bundle?: any;
        data: any;
    }

    interface ITNT {
        vm: VM;
    }
}
if (DEBUG) {
    window['tntWeakMap'] = {
        proxyMap, rawMap, rawNameMap, targetMap, handlerMap, unbindMap, rawDepsMap
    };
}

let _vmId = 0;
class VM {
    private _mvMap: Map<string, { data: object, tag: string }> = new Map();

    constructor() {
    }

    public VMTween(duration?: number) {
        return new GVMTween(duration);
    }

    public VMTag = VMTag;

    /**
     * 注册默认格式化方法
     *
     * @memberof VM
     */
    public registerDefaultFormatter = registerDefaultFormatter;

    /**
     *  注册组件默认属性
     *
     * @param {GConstructor<any>} clazz
     * @param {string} property
     * @memberof VM
     */
    public registerDefaultComponentProperty = registerDefaultComponentProperty;

    public get factory() {
        return VMFactory;
    }

    public observe<T extends object>(target: IMVVMObject): T
    public observe<T extends object>(target: IMVVMObject, tag: string): T
    public observe<T extends object>(data: T, tag: string): T
    public observe<T extends object>(target: IMVVMObject, data: T): T
    public observe<T extends object>(target: IMVVMObject, data: T, tag: string): T
    public observe<T extends object>(targetOrData: IMVVMObject | T, data?: T | string, tag?: string): T {
        let { target: _target, data: _data, tag: _tag } = _parseObserveArgs(targetOrData, data, tag);

        if (_tag == undefined || _tag == null) {
            console.error(`VM-> tag is null`);
            return;
        }

        let node: Node = null;
        let proxy: T = null;

        if (_data) {
            // 即使已经是代理，也要进行一次处理
            this._add(_data, _tag);

            if (rawMap.has(_data)) {
                console.warn(`_mvvm-> 数据本身已经是代理`);
                return data as T;
            }
            rawNameMap.set(_data, _tag);
            proxy = this._reactive(_data);
            if (_target) {
                _target.data = proxy;
            }

            if (_target) {
                if (_target instanceof Component) {
                    node = _target.node;
                } else if (_target instanceof Node) {
                    node = _target;
                }
            }
        }

        // 添加自动解绑监听
        if (node && _target && !unbindMap.has(_target)) {
            let _$50VMObserveAutoUnbind: IVMObserveAutoUnbind = {
                removeComponent: (comp) => {
                    if (_target instanceof Component && _target == comp) {
                        _$50VMObserveAutoUnbind.unbind();
                    }
                },
                nodeDestroyed: () => {
                    _$50VMObserveAutoUnbind.unbind();
                },
                unbind: () => {
                    tnt.vm._violate(_target);
                    node.targetOff(_$50VMObserveAutoUnbind);
                }
            }
            if (_target instanceof Component) {
                node.on(Node.EventType.COMPONENT_REMOVED, _$50VMObserveAutoUnbind.removeComponent, _$50VMObserveAutoUnbind);
            }
            node.on(Node.EventType.NODE_DESTROYED, _$50VMObserveAutoUnbind.nodeDestroyed, _$50VMObserveAutoUnbind);

            unbindMap.set(_target, _$50VMObserveAutoUnbind);
        }

        return proxy;
    }

    public violate(mvvmObject: IMVVMObject | string, ...tags: string[]) {
        if (typeof mvvmObject === 'string') {
            this._violate(mvvmObject, ...tags);
        } else {
            let _$50VMObserveAutoUnbind = unbindMap.get(mvvmObject);
            _$50VMObserveAutoUnbind?.unbind();
        }
    }

    private _violate(mvvmObject: IMVVMObject | string, ...tags: string[]) {

        tags.forEach(tag => {
            this._remove(tag);
        })

        if (typeof mvvmObject === 'string') {
            this._remove(mvvmObject);
        } else {
            this._remove(mvvmObject._vmTag);
            unbindMap.delete(mvvmObject);
        }
    }

    private _reactive<T extends Raw>(data: T): T {
        return _reactive(data);
    }


    /**
     * 组件/节点 绑定数据
     *
     * @template T
     * @param {IMVVMObject} mvvmObject
     * @param {T} bindObject
     * @param {(CustomAttrBind<T> | WatchPath)} attr
     * @param {Formatter<ReturnValueType>} [formatter]
     * @return {*} 
     * @memberof VM
     */
    public bind<T extends Component | Node, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: A)
    public bind<T extends Component | Node, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: WatchPath)
    public bind<T extends Component | Node, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: WatchPath, formatter: Formatter<ReturnValueType, unknown>)
    public bind<T extends Component | Node, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: A | WatchPath, formatter: Formatter<ReturnValueType, unknown>)
    public bind<T extends Component | Node, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: A | WatchPath, formatter?: Formatter<ReturnValueType, unknown>) {
        if (!bindObject) {
            console.error(`_mvvm-> 绑定对象不存在`);
            return;
        }
        let _attrs = formatAttr(mvvmObject, bindObject, attr, formatter);
        for (const key in _attrs) {
            const opt = _attrs[key] as VMCustomAttr<any>;
            lazyCheckWatchPath(opt.watchPath, mvvmObject.constructor.name, bindObject.name);
            opt.loaderKey = opt.loaderKey || mvvmObject.loaderKey;
            opt.bundle = opt.bundle || mvvmObject.bundle;
            this._collect(mvvmObject, bindObject, opt);
        }
    }

    /**
     * 对单个组件/节点 解绑数据
     *
     * @template T
     * @param {T} bindObject
     * @param {(handler: VMBaseHandler<any>) => boolean} [filter]
     * @memberof VM
     */
    public unbind<T extends Component | Node>(bindObject: T, filter?: (handler: VMBaseHandler<any>) => boolean) {
        let handlerArray = handlerMap.get(bindObject);
        let isUnbind = false;
        if (handlerArray) {
            for (let i = handlerArray.length; i--;) {
                const handler = handlerArray[i];
                let result = filter ? filter(handler) : true;
                if (result) {
                    isUnbind = true;
                    handler.unbind();
                    handlerArray.splice(i, 1);
                }
            }

            if (!handlerArray.length) {
                handlerMap.delete(bindObject);
            }
        }
        return isUnbind;
    }
    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: LabelAttrBind<Label>)
    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: WatchPath)
    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: WatchPath, formatter: Formatter<BaseValueType, unknown>)
    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: LabelAttrBind<Label> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
        // 有 formatter 的时候，一般使用默认属性， label.string 类型为 string

        let _label: Label = _typeTransition(bindObject, Label);
        this.bind(mvvmObject, _label, attr, formatter);
    }

    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: LabelAttrBind<RichText>)
    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: WatchPath)
    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: WatchPath, formatter: Formatter<BaseValueType, unknown>)
    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: LabelAttrBind<RichText> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
        // 有 formatter 的时候，一般使用默认属性， richText.string 类型为 string
        let _label: RichText = _typeTransition(bindObject, RichText);
        this.bind(mvvmObject, _label, attr, formatter);
    }


    public node(mvvmObject: IMVVMObject, node: Node, attr: CustomAttrBind<Node>)
    public node(mvvmObject: IMVVMObject, node: Node, attr: WatchPath)
    public node(mvvmObject: IMVVMObject, node: Node, attr: WatchPath, formatter: Formatter<boolean, unknown>)
    public node(mvvmObject: IMVVMObject, node: Node, attr: CustomAttrBind<Node> | WatchPath, formatter?: Formatter<boolean, unknown>) {
        // 有 formatter 的时候，一般使用默认属性， Node 为 node.active 类型为 boolean
        this.bind(mvvmObject, node, attr, formatter);
    }

    // public children<T extends Component | Node>(mvvmObject: IMVVMObject, parent: Node, component: Component | Node, attr: CustomAttrBind<T> | WatchPath, formatter?: Formatter<boolean, unknown>) {

    // }

    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: SkinAttrBind<Sprite>)
    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: WatchPath)
    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: WatchPath, formatter: Formatter<SpriteFrame, { bundle?: string, loaderKey: string }>)
    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: SkinAttrBind<Sprite> | WatchPath, formatter?: Formatter<SpriteFrame, { bundle?: string, loaderKey: string }>) {
        // spriteFrame
        let _comp: Sprite = _typeTransition(bindObject, Sprite);
        this.bind(mvvmObject, _comp, attr, formatter);
    }

    public progressBar(mvvmObject: IMVVMObject, bindObject: ProgressBar | Node, attr: CustomAttrBind<ProgressBar>)
    public progressBar(mvvmObject: IMVVMObject, bindObject: ProgressBar | Node, attr: WatchPath)
    public progressBar(mvvmObject: IMVVMObject, bindObject: ProgressBar | Node, attr: WatchPath, formatter: Formatter<number, unknown>)
    public progressBar(mvvmObject: IMVVMObject, bindObject: ProgressBar | Node, attr: CustomAttrBind<ProgressBar> | WatchPath, formatter?: Formatter<number, unknown>) {
        // 有 formatter 的时候，一般使用默认属性， ProgressBar，Slider 为 comp.progress 类型为 number
        let _comp = _typeTransition(bindObject, ProgressBar);
        this.bind(mvvmObject, _comp, attr, formatter);
    }

    public slider(mvvmObject: IMVVMObject, bindObject: Slider | Node, attr: CustomAttrBind<Slider>)
    public slider(mvvmObject: IMVVMObject, bindObject: Slider | Node, attr: WatchPath)
    public slider(mvvmObject: IMVVMObject, bindObject: Slider | Node, attr: WatchPath, formatter: Formatter<number, unknown>)
    public slider(mvvmObject: IMVVMObject, bindObject: Slider | Node, attr: CustomAttrBind<Slider> | WatchPath, formatter?: Formatter<number, unknown>) {
        // 有 formatter 的时候，一般使用默认属性， ProgressBar，Slider 为 comp.progress 类型为 number
        let _comp = _typeTransition(bindObject, Slider);
        this.bind(mvvmObject, _comp, attr, formatter);
    }

    public editBox<T extends EditBox, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public editBox<T extends EditBox, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public editBox<T extends EditBox, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<BaseValueType, unknown>)
    public editBox<T extends EditBox, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
        // string
        let _comp = _typeTransition(bindObject, EditBox);
        this.bind(mvvmObject, _comp, attr, formatter);
    }
    public toggle<T extends Toggle, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public toggle<T extends Toggle, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public toggle<T extends Toggle, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<boolean, unknown>)
    public toggle<T extends Toggle, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<boolean, unknown>) {
        // isChecked
        let _comp = _typeTransition(bindObject, Toggle);
        this.bind(mvvmObject, _comp, attr, formatter);
    }

    public uiOpacity<T extends UIOpacity, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public uiOpacity<T extends UIOpacity, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public uiOpacity<T extends UIOpacity, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<number, unknown>)
    public uiOpacity<T extends UIOpacity, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<number, unknown>) {
        // opacity
        let _comp = _typeTransition(bindObject, UIOpacity);
        this.bind(mvvmObject, _comp, attr, formatter);
    }


    public uiRenderer<T extends UIRenderer, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public uiRenderer<T extends UIRenderer, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public uiRenderer<T extends UIRenderer, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<Color, unknown>)
    public uiRenderer<T extends UIRenderer, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<Color, unknown>) {
        // color
        let _comp = _typeTransition(bindObject, UIRenderer);
        this.bind(mvvmObject, _comp, attr, formatter);
    }
    public uiTransform<T extends UITransform, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public uiTransform<T extends UITransform, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public uiTransform<T extends UITransform, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<Size, unknown>)
    public uiTransform<T extends UITransform, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<Size, unknown>) {
        // contentSize
        let _comp = _typeTransition(bindObject, UITransform);
        this.bind(mvvmObject, _comp, attr, formatter);
    }


    public button<T extends Button, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public button<T extends Button, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public button<T extends Button, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<boolean, unknown>)
    public button<T extends Button, A extends CustomAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<boolean, unknown>) {
        // interactable
        let _comp = _typeTransition(bindObject, Button);
        this.bind(mvvmObject, _comp, attr, formatter);
    }


    public skeleton<T extends sp.Skeleton, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public skeleton<T extends sp.Skeleton, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public skeleton<T extends sp.Skeleton, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<sp.SkeletonData, { bundle?: string, loaderKey: string }>)
    public skeleton<T extends sp.Skeleton, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<sp.SkeletonData, { bundle?: string, loaderKey: string }>) {
        // skeletonData
        let _comp = _typeTransition(bindObject, sp.Skeleton);
        this.bind(mvvmObject, _comp, attr, formatter);
    }

    public skin<T extends Renderer, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A)
    public skin<T extends Renderer, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath)
    public skin<T extends Renderer, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: WatchPath, formatter: Formatter<Asset, { bundle?: string, loaderKey: string }>)
    public skin<T extends Renderer, A extends SkinAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T | Node, attr: A | WatchPath, formatter?: Formatter<Asset, { bundle?: string, loaderKey: string }>) {
        // 
        let _comp = _typeTransition(bindObject, Renderer);
        this.bind(mvvmObject, _comp, attr, formatter);
    }

    /**
     * 关联子节点数量
     *
     * @param {IMVVMObject} target
     * @param {Node} parent
     * @param {VMForAttr} attr
     * @memberof VM
     */
    public for(target: IMVVMObject, parent: Node, attr: VMForAttr) {
        let _attr = instantiate(attr); // 使用副本数据
        _attr.watchPath = parseWatchPath(_attr.watchPath, target._vmTag);

        lazyCheckWatchPath(_attr.watchPath, target.constructor.name, parent.name);
        // 
        _attr._handler = VMHandlerName.For;
        this._collect(target, parent, _attr);
    }

    /**
     * 监听
     * 
     * @param {IMVVMObject} mvvmObject
     * @param {WatchPath} watchPath
     * @param {*} formatter
     * @memberof VM
     */
    public event(mvvmObject: IMVVMObject, watchPath: WatchPath, formatter: DataChanged) {
        let attr: VMEventAttr = {
            _handler: VMHandlerName.Event,
            onValueChange: formatter,
            watchPath: parseWatchPath(watchPath, mvvmObject._vmTag)
        }

        lazyCheckWatchPath(attr.watchPath, mvvmObject.constructor.name, "event");
        this._collect(mvvmObject, mvvmObject as any, attr);
    }

    private _collect<T extends Component | Node>(mvvmObject: IMVVMObject, bindObject: T, attr: VMBaseAttr<any>) {

        let handlerArray = handlerMap.get(bindObject) || [];
        for (let i = 0; i < handlerArray.length; i++) {
            const _vmTrigger = handlerArray[i];
            if (attr._targetPropertyKey && _vmTrigger.attr._targetPropertyKey === attr._targetPropertyKey) {
                DEBUG && console.warn(`_mvvm-> [${bindObject.name}] 组件的属性 [${attr._targetPropertyKey}] 已经有相同的处理`);
                return;
            }
        }

        // 设置默认的处理方法
        if (!attr._handler) {
            // 首先判断是否有 属性 对应的处理方法
            // 没有就直接用通用的方法
            attr._handler = this.factory.hasVMHandler(attr._targetPropertyKey) ? attr._targetPropertyKey : VMHandlerName.Common;
        }

        if (isArray(attr.watchPath)) {
            for (let j = 0; j < attr.watchPath.length; j++) {
                const watchPath = attr.watchPath[j];
                this._collectTarget(bindObject, watchPath);
            }
        } else {
            this._collectTarget(bindObject, attr.watchPath);
        }

        let _VMHandler = this.factory.getVMHandler(attr._handler);
        if (!_VMHandler) {
            console.error(`_mvvm-> [${bindObject.name}] [${attr._targetPropertyKey}] [${attr.watchPath}] 错误`);

            return;
        }
        let vmTrigger = new _VMHandler(bindObject, attr);
        vmTrigger.userControllerComponent = mvvmObject;
        handlerArray.push(vmTrigger);
        handlerMap.set(bindObject, handlerArray);
        vmTrigger.bind();

    }

    private _collectTarget<T extends Component | Node>(bindObject: T, watchPath: string) {
        let targetData = this._getDataByPath(watchPath);
        if (!targetData) {
            DEBUG && console.log(`_mvvm-> track [${watchPath}] 找不到数据`);
            return;
        }
        let comps = targetMap.get(targetData);
        if (!comps) { // 使用 Set 天然去重
            comps = new Set();
        }
        comps.add(bindObject);
        targetMap.set(targetData, comps);
    }

    public setValue(path: string, value: any) {
        if (path.startsWith("*")) {
            console.error(`_mvvm-> path 需要为完整路径`);
            return;
        }
        let targetData = this._getDataByPath(path);
        if (!targetData) {
            DEBUG && console.log(`_mvvm-> [${path}] 找不到数据`);
            return;
        }
        let proxy = this._reactive(targetData);
        let rs = path.split(".").map(val => val.trim());
        let key = rs[rs.length - 1];
        proxy[key] = value;
    }

    public getValue(path: string, defaultValue: any) {
        if (path.startsWith("*")) {
            console.error(`_mvvm-> path 需要为完整路径`);
            return;
        }
        let targetData = this._getDataByPath(path);
        if (!targetData) {
            DEBUG && console.log(`_mvvm-> [${path}] 找不到数据`);
            return defaultValue;
        }
        let proxy = this._reactive(targetData);
        let rs = path.split(".").map(val => val.trim());
        let key = rs[rs.length - 1];
        return proxy[key];
    }

    private _getDataByPath(path: string) {
        let rs = path.split(".").map(val => val.trim());
        let viewModel = this._mvMap.get(rs[0]);
        if (!viewModel) {
            return null;
        }
        let targetData = viewModel.data;
        // 掐头去尾
        for (let i = 1; i < rs.length - 1; i++) {
            targetData = targetData[rs[i]];
        }
        return targetData;
    }
    private _add<T extends object>(data: T, tag: string) {
        if (!data) {
            return;
        }
        if (tag.includes('.')) {
            console.warn('tag 中不能包含 [.] : ', tag);
            return;
        }

        let has = this._mvMap.has(tag);
        if (has) {
            console.warn('已存在 tag: ' + tag);
            return;
        }

        // 防止无法注册
        let isProxy = rawMap.has(data);
        if (isProxy) {
            data = rawMap.get(data) as T;
        }

        this._mvMap.set(tag, {
            data, tag
        })
    }

    private _remove(tag: string) {
        let has = this._mvMap.has(tag);
        if (!has) {
            DEBUG && console.warn(`_mvvm-> 不存在 ${tag} 数据，无法移除`);
            return;
        }
        this._mvMap.delete(tag);
    }



    private static _instance: VM = null
    public static getInstance(): VM {
        if (!this._instance) {
            this._instance = new VM();
        }
        return this._instance;
    }
}

function VMTag(target: IMVVMObject) {
    if (!target._vmTag) {
        if (target instanceof Component) {
            target._vmTag = ("VM-TAG-" + (target.name || "AUTO-") + '<' + target.uuid.replace('.', '') + '>');
        } else {
            target._vmTag = `VM-AUTO-${++_vmId}`;
        }
    }

    return target._vmTag;
}



function _typeTransition<T extends Component>(comp: T | Node, clazz: GConstructor<T>) {
    if (comp instanceof Node) {
        comp = comp.getComponent(clazz);
    }
    return comp;
}

function _parseObserveArgs<T extends object>(mvvmObjectOrData: IMVVMObject | T, data?: T | string, tag?: string) {
    let target: IMVVMObject = null;
    if (!tag) {
        if (typeof data === 'string') {
            tag = data;
            if (mvvmObjectOrData instanceof Component) {
                target = mvvmObjectOrData as any as IMVVMObject;
                target._vmTag = tag;
                data = target.data;
            } else {
                data = mvvmObjectOrData as T;
            }
        } else {
            if (typeof data !== 'undefined') {
                target = mvvmObjectOrData as IMVVMObject;
                VMTag(target);
                tag = target._vmTag;
                data = data;
            } else {
                target = mvvmObjectOrData as IMVVMObject;
                VMTag(target);
                tag = target._vmTag;
                data = target.data;
            }
        }
    } else {
        target = mvvmObjectOrData as IMVVMObject;
        target._vmTag = tag;
        data = data;
    }

    return { target, data: data as T, tag }
}

function lazyCheckWatchPath(_watchPath: string | string[], clazz, property) {
    if (!DEV) {
        return;
    }
    let _watchPaths = Array.isArray(_watchPath) ? _watchPath : [_watchPath];
    for (let i = 0; i < _watchPaths.length; i++) {
        const _tmpWatchPath = _watchPaths[i];
        if (_tmpWatchPath.startsWith('*')) {
            let idx = _tmpWatchPath.indexOf('.');
            if (idx == -1) {
                console.warn(`_mvvm-> ${clazz} ${property} watchPath error`);
                return false;
            }
        }
    }
    return true;
}

tnt.vm = VM.getInstance();

export { };
