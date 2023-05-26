import { CCObject, Component, Label, ValueType, Node, Sprite, EditBox, ProgressBar, RichText, Slider, Toggle, UIOpacity, UIRenderer, js, UITransform, isValid } from "cc";
import { DEV } from "cc/env";
import { TriggerName, TriggerOpTypes } from "./VMOperations";
import { ViewModel } from "./ViewModel";
import { VMTrigger } from "./triggers/VMTrigger";
import { GVMTween } from "./VMTween";
import { _isObject, _isArray, _isIntegerKey, _hasOwn, _hasChanged } from "./VMGeneral";
import { VMBaseAttr, AttrBind, WatchPath, Formator, ReturnValue, VMForAttr } from "./_mv_declare";
import { VMFatory } from "./VMFactory";



declare global {
    interface IMVVMObject {
        _vmTag?: string;
        data: any;
    }

    interface ITNT {
        vm: VM;
    }
}

interface Target {

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
const triggerMap = new WeakMap<Component | Node, VMTrigger<any>>();


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

if (DEV) {
    window['tntWeakMap'] = {
        proxyMap, proxySet, objectNameMap, targetMap, triggerMap
    };
}

let _vmId = 0;
class VM {
    private _mvMap: Map<string, ViewModel<any>> = new Map();

    constructor() {
    }

    public VMTween(duration?: number) {
        return new GVMTween(duration);
    }

    public VMTag = VMTag;

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

        objectNameMap.set(_data, _tag);
        let proxy = this._reactive(_data);
        if (_target) {
            _target.data = proxy;
        }

        this._add(_data, _tag);

        return proxy;
    }

    public violate(mvvmObject: IMVVMObject | string, ...tags: string[]) {
        tags.forEach(tag => {
            this._remove(tag);
        })

        if (typeof mvvmObject === 'string') {
            this._remove(mvvmObject);
        } else {
            this._remove(mvvmObject._vmTag);
        }
    }


    private _reactive<T extends object>(data: T): T {
        if (proxySet.has(data)) {
            console.warn(`_mvvm-> 本身已经是代理`);
            return data;
        }
        if (!_isObject(data)) {
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
                if (_isObject(res)) {
                    depsMap.set(res as object, target);
                    objectNameMap.set(res as object, key);
                    console.log(`_mvvm->【读取】${String(key)} 值为 ${res?.toString()} 注册代理`);
                    return self._reactive(res as object);
                }
                console.log(`_mvvm->【读取】 ${String(key)}  不用注册代理`);
                return res;
            },
            set(target, key: PropertyKey, newValue, receiver?: any) {
                let oldValue = target[key];
                const isObject = _isObject(newValue);
                const hadKey = _isArray(target) && _isIntegerKey(key) ? Number(key) < target.length : _hasOwn(target, key);
                const res = Reflect.set(target, key, newValue, receiver);
                if (!hadKey) {
                    if (isObject) {
                        depsMap.set(newValue as object, target);
                        objectNameMap.set(newValue as object, key);
                    }
                    self._trigger(target, TriggerOpTypes.ADD, key, newValue, oldValue);
                } else if (_hasChanged(newValue, oldValue)) {
                    // TODO：对数组进行特殊处理 （length = 0）

                    self._trigger(target, TriggerOpTypes.SET, key, newValue, oldValue);
                }

                console.log(`_mvvm-> 【设置】${String(key)} 值为： ${newValue}`);
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
                console.log(`_mvvm-> 【删除】${String(key)}`);
                const hadKey = _hasOwn(target, key)
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
     * @param {(AttrBind<T> | WatchPath)} attr
     * @param {Formator<ReturnValue>} [formator]
     * @return {*} 
     * @memberof VM
     */
    public bind<T extends Component | Node>(mvvmObject: IMVVMObject, bindObject: T, attr: AttrBind<T> | WatchPath, formator?: Formator<ReturnValue>) {
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

    private _track<T extends Component | Node>(mvvmObject: IMVVMObject, bindObject: T, attr: VMBaseAttr<any>) {
        if (!_isArray(attr.watchPath)) {
            this.__track(mvvmObject, bindObject, attr, attr.watchPath);
        } else {
            for (let i = 0; i < attr.watchPath.length; i++) {
                const watchPath = attr.watchPath[i];
                this.__track(mvvmObject, bindObject, attr, watchPath);
            }
        }
    }
    private __track<T extends Component | Node>(mvvmObject: IMVVMObject, bindObject: T, attr: VMBaseAttr<any>, watchPath: string) {
        let targetData = this._getDataByPath(watchPath);
        if (!targetData) {
            console.log(`_mvvm-> track [${watchPath}] 找不到数据`);
            return;
        }
        let comps = targetMap.get(targetData);
        if (!comps) { // 使用 Set 天然去重
            comps = new Set();
        }
        // 设置默认的处理方法
        if (!attr._trigger) {
            attr._trigger = TriggerName.Common;
        }

        comps.add(bindObject);
        targetMap.set(targetData, comps);
        let _VMTrigger = VMFatory.getVMTrigger(attr._trigger);
        let vmTrigger = new _VMTrigger(bindObject, attr);
        vmTrigger.userControllerComponent = mvvmObject;
        triggerMap.set(bindObject, vmTrigger);
        vmTrigger.bind();

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
                let vmTrigger = triggerMap.get(_target);
                if (vmTrigger.isWatchPath(fullPath)) {
                    vmTrigger.trigger(newValue, oldValue, type, fullPath);
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

    public label(mvvmObject: IMVVMObject, bindObject: Label | Node, attr: AttrBind<Label> | WatchPath, formator?: Formator<string>) {
        let _label: Label = _typeTransition(bindObject, Label);
        this.bind(mvvmObject, _label, attr, formator);
    }

    public node(mvvmObject: IMVVMObject, node: Node, attr: AttrBind<Node> | WatchPath, formator?: Formator<boolean>) {
        this.bind(mvvmObject, node, attr, formator);
    }


    /**
     * 关联子节点数量
     *
     * @template T
     * @param {IMVVMObject} target
     * @param {Node} parent
     * @param {VMForAttr} attr
     * @memberof VM
     */
    public for<T>(target: IMVVMObject, parent: Node, attr: VMForAttr) {
        attr.watchPath = _parseWatchPath(attr.watchPath, target._vmTag);
        this._track(target, parent, attr);
    }

    // public click() {

    // }

    public setValue(path: string, value: any) {
        let targetData = this._getDataByPath(path);
        if (!targetData) {
            console.log(`_mvvm-> [${path}] 找不到数据`);
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
            console.log(`_mvvm-> [${path}] 找不到数据`);
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
    private _add<T>(data: T, tag: string) {
        if (tag.includes('.')) {
            console.warn('tag 中不能包含 [.] : ', tag);
            return;
        }

        let has = this._mvMap.has(tag);
        if (has) {
            console.warn('已存在 tag: ' + tag);
            return;
        }

        let vm = new ViewModel<T>(data, tag);
        this._mvMap.set(tag, vm)
    }

    private _remove(tag: string) {
        let has = this._mvMap.has(tag);
        if (!has) {
            console.warn(`_mvvm-> 不存在 ${tag} 数据`);
            return;
        }
        // let mv = this._mvMap.get(tag);
        this._mvMap.delete(tag);

        // this.__remove(mv.data);
    }

    // private __remove(data: object) {
    //     if (!_isObject(data)) {
    //         return;
    //     }
    //     if (!targetMap.has(data)) {
    //         for (const key in data) {
    //             this.__remove(data[key]);
    //         }
    //         return;
    //     }
    //     let comps = targetMap.get(data);
    //     comps.forEach((bindObject) => {
    //         let vmTrigger = triggerMap.get(bindObject);
    //         vmTrigger.unbind();
    //         triggerMap.delete(bindObject);
    //     });
    //     comps.clear();
    //     targetMap.delete(comps);
    // }



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

function _formatAttr<T>(mvvmObject: IMVVMObject, component: T, attr: AttrBind<T> | WatchPath, formator?: Formator<ReturnValue>) {
    let _attr: AttrBind<any> = null;
    if (typeof attr === 'string' || _isArray(attr)) {
        let defKey = _getDefaultKey(component);
        _attr = {
            [defKey]: {
                _targetPropertyKey: defKey,
                watchPath: _parseWatchPath(attr, mvvmObject._vmTag),
                formator: formator
            }
        }
    } else {
        for (const key in attr) {
            const element = attr[key];
            if (typeof element === 'string' || _isArray(element)) {
                let observeAttr: VMBaseAttr<any> = {
                    watchPath: _parseWatchPath(element as string, mvvmObject._vmTag),
                    formator: null,
                    _targetPropertyKey: key,
                }
                attr[key] = observeAttr;
            } else {
                element.watchPath = _parseWatchPath(element.watchPath, mvvmObject._vmTag);
                element._targetPropertyKey = key;
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
            console.error(`_mvvm->[${tag}] watchPath is err`);
        }
        //遇到特殊 path 就优先替换路径
        if (path.startsWith('*')) {
            watchPath = path.replace('*', tag);
        }
    } else if (Array.isArray(path)) {
        for (let j = 0; j < path.length; j++) {
            const _path = path[j].trim();
            if (!_path) {
                console.error(`_mvvm->[${tag}] watchPath is err`);
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
