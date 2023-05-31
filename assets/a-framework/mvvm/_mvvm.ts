import { Component, Label, Node, Sprite, EditBox, ProgressBar, RichText, Slider, Toggle, UIOpacity, UIRenderer, js, UITransform, isValid, SpriteFrame } from "cc";
import { DEBUG } from "cc/env";
import { VMHandlerName, TriggerOpTypes } from "./VMOperations";
import { VMBaseHandler } from "./handlers/VMBaseHandler";
import { GVMTween } from "./VMTween";
import { isObject, isArray, isIntegerKey, hasOwn, hasChanged } from "./VMGeneral";
import { VMBaseAttr, BaseAttrBind, WatchPath, Formator, ReturnValueType, VMForAttr, SpriteAttrBind, VMSpriteAttr, LabelAttrBind, BaseValueType } from "./_mv_declare";
import { VMFatory } from "./VMFactory";



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

interface Target {

}

interface IVMObserveAutoUnbind {
    removeComponent(comp: Component);
    nodeDestroyed();
    unbind();
}

// 缓存代理
const proxyMap = new WeakMap<Target, any>();
// 防止重复注册
const proxySet = new WeakSet();
// 数据依赖
const depsMap = new WeakMap<Target, Target>(); // key 为原始数据对象 value 为原始数据对象
// 数据对象名称
const objectNameMap = new WeakMap<Target, PropertyKey>();  // key 为原始数据对象 value 为数据名称
const targetMap = new WeakMap<Target, Set<Component | Node>>(); // key 为原始数据对象
const handlerMap = new WeakMap<Component | Node, Array<VMBaseHandler<any>>>();
const unbindMap = new WeakMap<IMVVMObject, IVMObserveAutoUnbind>();


const _defaultKey: WeakMap<Object, string> = new WeakMap();
_defaultKey.set(Label, "string");
_defaultKey.set(RichText, "string");
_defaultKey.set(EditBox, "string");
_defaultKey.set(Sprite, "spriteFrame");
_defaultKey.set(ProgressBar, "progress");
_defaultKey.set(Slider, "progress");
_defaultKey.set(Toggle, "isChecked");
_defaultKey.set(Node, "active");
_defaultKey.set(UIOpacity, "opacity");
_defaultKey.set(UIRenderer, "color");
_defaultKey.set(UITransform, "contentSize");

// 默认的格式化方法
const _defaultFormator: WeakMap<Object, Formator<any, any>> = new WeakMap();
_defaultFormator.set(Sprite, async (options) => {
    let spriteFrame = await new Promise<SpriteFrame>((rs) => {
        tnt.resourcesMgr.load(options.loaderKey, options.newValue, SpriteFrame, (err, spriteFrame) => {
            rs(err ? null : spriteFrame);
        }, options.bundle);
    });
    return spriteFrame;
});


if (DEBUG) {
    window['tntWeakMap'] = {
        proxyMap, proxySet, objectNameMap, targetMap, handlerMap, unbindMap
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
    public registerDefaultFormator = registerDefaultFormator;

    public get fatory() {
        return VMFatory.getInstance();
    }

    public observe(target: IMVVMObject)
    public observe(target: IMVVMObject, tag: string)
    public observe(data: object, tag: string)
    public observe(target: IMVVMObject, data: object)
    public observe(target: IMVVMObject, data: object, tag: string)
    public observe(targetOrData: IMVVMObject | object, data?: object | string, tag?: string) {
        let { target: _target, data: _data, tag: _tag } = _parseObserveArgs(targetOrData, data, tag);

        if (_tag == undefined || _tag == null) {
            console.error(`VM-> tag is null`);
            return;
        }
        if (proxySet.has(_data)) {
            console.warn(`_mvvm-> 数据本身已经是代理`);
            return data;
        }

        objectNameMap.set(_data, _tag);
        let proxy = this._reactive(_data);
        if (_target) {
            _target.data = proxy;
        }

        this._add(_data, _tag);


        let node: Node = null;
        if (_target) {
            if (_target instanceof Component) {
                node = _target.node;
            } else if (_target instanceof Node) {
                node = _target;
            }
        }
        // 添加自动解绑监听
        if (node) {
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

    private _reactive<T extends object>(data: T): T {
        if (proxySet.has(data)) {
            console.warn(`_mvvm-> 本身已经是代理`);
            return data;
        }
        if (!isObject(data)) {
            console.warn(`_mvvm-> 非对象无法进行代理: ${String(data)}`)
            return data;
        }

        const existingProxy = proxyMap.get(data);
        if (existingProxy) {
            return existingProxy;
        }

        let self = this;
        const proxy = new Proxy(data, {
            get(target, key: PropertyKey, receiver?: any) {
                const res = Reflect.get(target, key, receiver);
                if (isObject(res)) {
                    depsMap.set(res as object, target);
                    objectNameMap.set(res as object, key);
                    // console.log(`_mvvm->【读取】${String(key)} 值为 ${res?.toString()} 注册代理`);
                    return self._reactive(res as object);
                }
                // console.log(`_mvvm->【读取】 ${String(key)}  不用注册代理`);
                return res;
            },
            set(target, key: PropertyKey, newValue, receiver?: any) {
                let oldValue = target[key];
                const _isObject = isObject(newValue);
                const _isArray = isArray(target);
                const hadKey = _isArray && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
                const res = Reflect.set(target, key, newValue, receiver);
                if (!hadKey) {
                    if (_isObject) {
                        depsMap.set(newValue as object, target);
                        objectNameMap.set(newValue as object, key);
                    }
                    self._trigger(target, TriggerOpTypes.ADD, key, newValue, oldValue);
                } else if (hasChanged(newValue, oldValue)) {
                    // TODO：对数组进行特殊处理 length
                    if (_isArray && key === 'length') {

                    }
                    self._trigger(target, TriggerOpTypes.SET, key, newValue, oldValue);
                }

                // console.log(`_mvvm-> 【设置】${String(key)} 值为： ${newValue}`);
                return res;
            },
            has(target, p) {
                let _has = Reflect.has(target, p);
                return _has;
            },
            ownKeys(target) {
                return Reflect.ownKeys(target);
            },
            deleteProperty(target, key: PropertyKey) {
                // console.log(`_mvvm-> 【删除】${String(key)}`);
                const hadKey = hasOwn(target, key)
                const oldValue = (target as any)[key]
                const result = Reflect.deleteProperty(target, key);
                if (result && hadKey) {
                    self._trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
                }
                return result;
            }
        });

        proxyMap.set(data, proxy);
        proxySet.add(proxy);
        return proxy;
    }


    /**
     * 根据
     *
     * @template T
     * @param {IMVVMObject} mvvmObject
     * @param {T} bindObject
     * @param {(BaseAttrBind<T> | WatchPath)} attr
     * @param {Formator<ReturnValueType>} [formator]
     * @return {*} 
     * @memberof VM
     */
    public bind<T extends Component | Node, A extends BaseAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: A)
    public bind<T extends Component | Node, A extends BaseAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: WatchPath)
    public bind<T extends Component | Node, A extends BaseAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: WatchPath, formator: Formator<ReturnValueType, unknown>)
    public bind<T extends Component | Node, A extends BaseAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: A | WatchPath, formator: Formator<ReturnValueType, unknown>)
    public bind<T extends Component | Node, A extends BaseAttrBind<T>>(mvvmObject: IMVVMObject, bindObject: T, attr: A | WatchPath, formator?: Formator<ReturnValueType, unknown>) {
        if (!bindObject) {
            console.error(`_mvvm-> 绑定对象不存在`);
            return;
        }
        let _attrs = _formatAttr(mvvmObject, bindObject, attr, formator);
        for (const key in _attrs) {
            const opt = _attrs[key] as VMBaseAttr<any>;
            this._track(mvvmObject, bindObject, opt);
        }
    }


    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: LabelAttrBind<Label>)
    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: WatchPath, formator?: Formator<BaseValueType, unknown>)
    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: LabelAttrBind<Label> | WatchPath, formator?: Formator<BaseValueType, unknown>) {
        // 有 formator 的时候，一般使用默认属性， label.string 类型为 string
        let _label: Label = _typeTransition(bindObject, Label);
        this.bind(mvvmObject, _label, attr, formator);
    }

    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: LabelAttrBind<RichText>)
    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: WatchPath, formator?: Formator<BaseValueType, unknown>)
    public richText(mvvmObject: IMVVMObject, bindObject: RichText | Node, attr: LabelAttrBind<RichText> | WatchPath, formator?: Formator<BaseValueType, unknown>) {
        // 有 formator 的时候，一般使用默认属性， richText.string 类型为 string
        let _label: RichText = _typeTransition(bindObject, RichText);
        this.bind(mvvmObject, _label, attr, formator);
    }


    public node(mvvmObject: IMVVMObject, node: Node, attr: BaseAttrBind<Node>)
    public node(mvvmObject: IMVVMObject, node: Node, attr: WatchPath, formator?: Formator<boolean, unknown>)
    public node(mvvmObject: IMVVMObject, node: Node, attr: BaseAttrBind<Node> | WatchPath, formator?: Formator<boolean, unknown>) {
        // 有 formator 的时候，一般使用默认属性， Node 为 node.active 类型为 boolean
        this.bind(mvvmObject, node, attr, formator);
    }

    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: SpriteAttrBind<Sprite>)
    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: WatchPath, formator?: Formator<SpriteFrame, { bundle?: string, loaderKey: string }>)
    public sprite(mvvmObject: IMVVMObject, bindObject: Sprite | Node, attr: SpriteAttrBind<Sprite> | WatchPath, formator?: Formator<SpriteFrame, { bundle?: string, loaderKey: string }>) {

        if (!bindObject) {
            console.error(`_mvvm-> 绑定对象不存在`);
            return;
        }
        let _comp: Sprite = _typeTransition(bindObject, Sprite);
        let _attrs = _formatAttr(mvvmObject, _comp, attr, formator);
        for (const key in _attrs) {
            const opt = _attrs[key] as VMSpriteAttr<any>;
            opt.loaderKey = opt.loaderKey || mvvmObject.loaderKey;
            opt.bundle = opt.bundle || mvvmObject.bundle;
            this._track(mvvmObject, _comp, opt);
        }
    }

    public progressBar(mvvmObject: IMVVMObject, bindObject: ProgressBar | Node, attr: BaseAttrBind<ProgressBar> | WatchPath, formator?: Formator<number, unknown>) {
        // 有 formator 的时候，一般使用默认属性， ProgressBar，Slider 为 comp.progress 类型为 number
        let _comp = _typeTransition(bindObject, ProgressBar);
        this.bind(mvvmObject, _comp, attr, formator);
    }

    public silder(mvvmObject: IMVVMObject, bindObject: Slider | Node, attr: BaseAttrBind<Slider> | WatchPath, formator?: Formator<number, unknown>) {
        // 有 formator 的时候，一般使用默认属性， ProgressBar，Slider 为 comp.progress 类型为 number
        let _comp = _typeTransition(bindObject, Slider);
        this.bind(mvvmObject, _comp, attr, formator);
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
        attr.watchPath = _parseWatchPath(attr.watchPath, target._vmTag);
        this._track(target, parent, attr);
    }

    // public click() {

    // }

    private _track<T extends Component | Node>(mvvmObject: IMVVMObject, bindObject: T, attr: VMBaseAttr<any>) {
        // if (!isArray(attr.watchPath)) {
        //     this.__track(mvvmObject, bindObject, attr, attr.watchPath);
        // } else {
        //     for (let i = 0; i < attr.watchPath.length; i++) {
        //         const watchPath = attr.watchPath[i];
        //         this.__track(mvvmObject, bindObject, attr, watchPath);
        //     }
        // }

        this.__track(mvvmObject, bindObject, attr);
    }
    private __track<T extends Component | Node>(mvvmObject: IMVVMObject, bindObject: T, attr: VMBaseAttr<any>) {
        let triggerArray = handlerMap.get(bindObject) || [];
        for (let i = 0; i < triggerArray.length; i++) {
            const _vmTrigger = triggerArray[i];
            if (_vmTrigger.attr._targetPropertyKey === attr._targetPropertyKey) {
                DEBUG && console.warn(`_mvvm-> [${bindObject.name}] 组件的属性 [${attr._targetPropertyKey}] 已经有相同的处理`);
                return;
            }
        }

        // 设置默认的处理方法
        if (!attr._handler) {
            // 首先判断是否有 属性 对应的处理方法
            // 没有就直接用通用的方法
            attr._handler = this.fatory.hasVMHandler(attr._targetPropertyKey) ? attr._targetPropertyKey : VMHandlerName.Common;
        }

        if (isArray(attr.watchPath)) {
            for (let j = 0; j < attr.watchPath.length; j++) {
                const watchPath = attr.watchPath[j];
                this._collectTarget(bindObject, watchPath);
            }
        } else {
            this._collectTarget(bindObject, attr.watchPath);
        }

        let _VMHandler = this.fatory.getVMHandler(attr._handler);
        if (!_VMHandler) {
            console.error(`_mvvm-> [${bindObject.name}] [${attr._targetPropertyKey}] [${attr.watchPath}] 错误`);

            return;
        }
        let vmTrigger = new _VMHandler(bindObject, attr);
        vmTrigger.userControllerComponent = mvvmObject;
        triggerArray.push(vmTrigger);
        handlerMap.set(bindObject, triggerArray);
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

    private _trigger(target: object, type: TriggerOpTypes, key: PropertyKey, newValue: any, oldValue: any) {
        let targets = targetMap.get(target); //
        if (targets) {
            let _deleteArr: any[] = null;
            let fullPath = _getFullWatchPath(target, key);
            // let proxy = this._reactive(target);
            targets.forEach((_target) => {
                if (!isValid(_target)) {
                    _deleteArr = _deleteArr || [];
                    _deleteArr.push(_target);
                    return;
                }
                let vmTriggerArray = handlerMap.get(_target);
                for (let i = 0; i < vmTriggerArray.length; i++) {
                    const vmTrigger = vmTriggerArray[i];
                    if (vmTrigger.isWatchPath(fullPath)) {
                        vmTrigger.handle(newValue, oldValue, type, fullPath);
                    }
                }
            });

            if (_deleteArr) {
                for (let i = 0; i < _deleteArr.length; i++) {
                    const element = _deleteArr[i];
                    targets.delete(element);
                }
                _deleteArr = null;
            }
        }
    }

    public setValue(path: string, value: any) {
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
        let data = this._mvMap.get(rs[0]);
        let targetData = data.data;
        // 掐头去尾
        for (let i = 1; i < rs.length - 1; i++) {
            targetData = targetData[rs[i]];
        }
        return targetData;
    }
    private _add(data: object, tag: string) {
        if (tag.includes('.')) {
            console.warn('tag 中不能包含 [.] : ', tag);
            return;
        }

        let has = this._mvMap.has(tag);
        if (has) {
            console.warn('已存在 tag: ' + tag);
            return;
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
        target._vmTag = `VM-AUTO-${_vmId}`;
        _vmId++;
    }
}



function _getDefaultKey(component: Object) {
    let defKey = "string";
    let clazz = js.getClassByName(js.getClassName(component));
    if (_defaultKey.has(clazz)) {
        defKey = _defaultKey.get(clazz);
    }
    return defKey;
}
/**
 * 注册默认格式化方法
 *
 * @template T
 * @param {GConstructor<T>} clazz
 * @param {Formator<any, any>} formator
 * @return {*} 
 */
function registerDefaultFormator<T>(clazz: GConstructor<T>, formator: Formator<any, any>) {
    if (!clazz || !formator) {
        return;
    }
    _defaultFormator.set(clazz, formator)
}
function _getDefaultFormator(component: Object) {
    let defFormator = null;
    let clazz = js.getClassByName(js.getClassName(component));
    if (_defaultFormator.has(clazz)) {
        defFormator = _defaultFormator.get(clazz);
    }
    return defFormator;
}
function _typeTransition<T extends Component>(comp: T | Node, clazz: GConstructor<T>) {
    if (comp instanceof Node) {
        comp = comp.getComponent(clazz);
    }
    return comp;
}

function _parseObserveArgs(mvvmObjectOrData: IMVVMObject | object, data?: object | string, tag?: string) {
    let target: IMVVMObject = null;
    if (!tag) {
        if (typeof data === 'string') {
            tag = data;
            if (mvvmObjectOrData instanceof Component) {
                target = mvvmObjectOrData as any as IMVVMObject;
                target._vmTag = tag;
                data = target.data;
            } else {
                data = mvvmObjectOrData;
            }
        } else {
            if (typeof data !== 'undefined') {
                target = mvvmObjectOrData as IMVVMObject;
                VMTag(target);
                tag = target._vmTag;
                data = data as object;
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
        data = data as object;
    }

    return { target, data: data as object, tag }
}

function _formatAttr<T>(mvvmObject: IMVVMObject, component: T, attr: BaseAttrBind<T> | WatchPath, formator?: Formator<ReturnValueType, unknown>) {
    let _attr: BaseAttrBind<any> = null;
    if (typeof attr === 'string' || isArray(attr)) {
        let defKey = _getDefaultKey(component);
        _attr = {
            [defKey]: {
                _targetPropertyKey: defKey,
                watchPath: _parseWatchPath(attr, mvvmObject._vmTag),
                formator: formator || _getDefaultFormator(component)
            }
        }
    } else {
        for (const key in attr) {
            const element = attr[key];
            if (typeof element === 'string' || isArray(element)) {
                let observeAttr: VMBaseAttr<any> = {
                    watchPath: _parseWatchPath(element as string, mvvmObject._vmTag),
                    formator: _getDefaultFormator(component),
                    _targetPropertyKey: key,
                }
                attr[key] = observeAttr;
            } else {
                element.watchPath = _parseWatchPath(element.watchPath, mvvmObject._vmTag);
                element._targetPropertyKey = key;
                if (!element.formator) {
                    element.formator = _getDefaultFormator(component)
                }
            }
        }
        _attr = attr;
    }
    return _attr;
}
function _parseWatchPath(watchPath: string | string[], tag: string) {
    let path: string | string[] = watchPath;
    if (typeof path == 'string') {
        path = path.trim();
        if (!path) {
            if (DEBUG) {
                throw new Error(`[${tag}] watchPath is err`);
            } else {
                console.error(`_mvvm->[${tag}] watchPath is err`);
            }
        }
        //遇到特殊 path 就优先替换路径
        if (path.startsWith('*')) {
            watchPath = path.replace('*', tag);
        }
    } else if (Array.isArray(path)) {
        for (let j = 0; j < path.length; j++) {
            const _path = path[j].trim();
            if (!_path) {
                if (DEBUG) {
                    throw new Error(`[${tag}] watchPath is err`);
                } else {
                    console.error(`_mvvm->[${tag}] watchPath is err`);
                }
            }
            if (_path.startsWith('*')) {
                path[j] = _path.replace('*', tag);
            }
        }
        watchPath = path;
    }
    return watchPath;
}


function _getFullWatchPath(target: object, propertyKey: PropertyKey) {
    let parent = target;
    let objectName: PropertyKey = "";
    let pathArr = [propertyKey];
    while (parent) {
        objectName = objectNameMap.get(parent); // 先获取对象名称（属性名）
        parent = depsMap.get(parent); // 获取被依赖的数据
        pathArr.unshift(objectName); // 最前面插入名称
    }

    let pathStr = pathArr.join(".");
    return pathStr;
}

tnt.vm = VM.getInstance();

export { };
