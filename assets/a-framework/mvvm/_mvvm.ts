import { CCObject, Component, Label, ValueType, Node, Sprite, EditBox, ProgressBar, RichText, Slider, Toggle, UIOpacity, UIRenderer, js } from "cc";
import { DEV } from "cc/env";
import { ViewModel } from "./ViewModel";
import { GVMTween } from "./VMTween";

type WatchPath = string | string[];
type ReturnValue = string | number | boolean | CCObject | ValueType;

type FormatorOpts = { newValue: any, oldValue?: any, node?: Node, nodeIdx?: number, watchPath?: WatchPath };
type Formator<T> = (options: FormatorOpts) => T | Promise<T>;


// 观察属性选项
type ObserveAttrOptions<T> = {
    watchPath: WatchPath;
    tween?: IVMTween;

    formator?: Formator<T>;
}

// 属性绑定
type AttrBind<T> = {
    [P in keyof T]?: WatchPath | ObserveAttrOptions<T[P]>;
};

declare global {
    interface IMVVM {
        _vmTag?: string;
        data: any;
    }

    interface ITNT {
        vm: VM;
    }
}

const _isArray = Array.isArray;
const _isObject = (val) => val !== null && typeof val === "object";
const _isString = (val: unknown): val is string => typeof val === 'string';
const _isIntegerKey = (key: unknown) => _isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
const _hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (
    val: object,
    key: PropertyKey
): key is keyof typeof val => hasOwnProperty.call(val, key);


interface Target {

}

const enum TriggerOpTypes {
    SET = 'set',
    ADD = 'add',
    DELETE = 'delete',
    CLEAR = 'clear'
}

// 缓存代理
const reactiveMap = new WeakMap<Target, any>();
// 防止重复注册
const proxySet = new WeakSet();
// 依赖
const depsMap = new WeakMap();
// 对象名称
const objectNameMap = new WeakMap();

class VM {
    private static id = 0;
    private _defObserverKey: WeakMap<Object, string> = new WeakMap();
    private _mvMap: Map<string, object> = new Map();


    constructor() {
        this._defObserverKey.set(Label, "string");
        this._defObserverKey.set(RichText, "string");
        this._defObserverKey.set(EditBox, "string");
        this._defObserverKey.set(Sprite, "spriteFrame");
        this._defObserverKey.set(ProgressBar, "progress");
        this._defObserverKey.set(Slider, "progress");
        this._defObserverKey.set(Toggle, "isChecked");
        this._defObserverKey.set(Node, "active");
        this._defObserverKey.set(UIOpacity, "opacity");
        this._defObserverKey.set(UIRenderer, "color");
    }


    public VMTag(target: IMVVM) {
        if (!target._vmTag) {
            target._vmTag = `VM-AUTO-${VM.id}`;
            VM.id++;
        }
    }

    public VMTween(duration?: number) {
        return new GVMTween(duration);
    }

    public observe(target: IMVVM)
    public observe(target: IMVVM, tag: string)
    public observe(data: object, tag: string)
    public observe(target: IMVVM, data: object)
    public observe(target: IMVVM, data: object, tag: string)
    public observe(targetOrData: IMVVM | object, data?: object | string, tag?: string) {
        let { target: _target, data: _data, tag: _tag } = this._parseObserveArgs(targetOrData, data, tag);

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
    }

    public violate(target: IMVVM | string, ...tags: string[]) {
        tags.forEach(tag => {
            this._remove(tag);
        })

        if (typeof target === 'string') {
            this._remove(target);
        } else {
            this._remove(target._vmTag);
        }
    }

    
    private _reactive<T extends object>(data: T): T {
        if (proxySet.has(data)) {
            console.warn(`_mvvm-> 本身已经是代理`);
            return data;
        }
        if (!_isObject(data)) {
            console.warn(`_mvvm-> value cannot be made reactive: ${String(data)}`)
            return data;
        }

        const existingProxy = reactiveMap.get(data);
        if (existingProxy) {
            console.log(`_mvvm-> 已存在代理`);
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
                const hadKey = _isArray(target) && _isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
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

            deleteProperty(target, key: PropertyKey) {
                console.log(`_mvvm-> 【删除】${String(key)}`);
                const hadKey = hasOwn(target, key)
                const oldValue = (target as any)[key]
                const result = Reflect.deleteProperty(target, key);
                if (result && hadKey) {
                    self._trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
                }
                return result;
            }
        });

        reactiveMap.set(data, proxy);
        proxySet.add(proxy);
        return proxy;
    }


    public bind<T>(target: IMVVM, component: T, attr: AttrBind<T> | WatchPath, formator?: Formator<ReturnValue>) {
        let _attr = this._formatAttr(target, component, attr, formator);
        console.log(`_mvvm-> `);

    }

    public label(target: IMVVM, label: Label | Node, attr: AttrBind<Label> | WatchPath, formator?: Formator<string>) {
        let _label: Label = this._typeTransition(label, Label);
        this.bind(target, _label, attr, formator);
    }

    private _getObserverKey(component: Object) {
        let defKey = "string";
        let clazz = js.getClassByName(js.getClassName(component));
        if (this._defObserverKey.has(clazz)) {
            defKey = this._defObserverKey.get(clazz);
        }
        return defKey;
    }

    private _typeTransition<T extends Component>(comp: T | Node, clazz: GConstructor<T>) {
        if (comp instanceof Node) {
            comp = comp.getComponent(clazz);
        }
        return comp;
    }

    private _parseObserveArgs(targetOrData: IMVVM | object, data?: object | string, tag?: string) {
        let target: IMVVM = null;
        if (!tag) {
            if (typeof data === 'string') {
                tag = data;
                if (targetOrData instanceof Component) {
                    target = targetOrData as any as IMVVM;
                    target._vmTag = tag;
                    data = target.data;
                } else {
                    data = targetOrData;
                }
            } else {
                if (typeof data !== 'undefined') {
                    target = targetOrData as IMVVM;
                    this.VMTag(target);
                    tag = target._vmTag;
                    data = data as object;
                } else {
                    target = targetOrData as IMVVM;
                    this.VMTag(target);
                    tag = target._vmTag;
                    data = target.data;
                }
            }
        } else {
            target = targetOrData as IMVVM;
            target._vmTag = tag;
            data = data as object;
        }

        return { target, data: data as object, tag }
    }

    private _formatAttr<T>(target: IMVVM, component: T, attr: AttrBind<T> | WatchPath, formator?: Formator<ReturnValue>) {
        let _attr: AttrBind<any> = null;
        if (typeof attr === 'string' || _isArray(attr)) {
            let defKey = this._getObserverKey(component);
            _attr = {
                [defKey]: {
                    watchPath: this._parseWatchPath(attr, target._vmTag),
                    formator: formator
                }
            }
        } else {
            for (const key in attr) {
                const element = attr[key];
                if (typeof element === 'string' || _isArray(element)) {
                    let observeAttr: ObserveAttrOptions<any> = {
                        watchPath: this._parseWatchPath(element as string, target._vmTag),
                        formator: null,
                    }
                    attr[key] = observeAttr;
                } else {
                    element.watchPath = this._parseWatchPath(element.watchPath, target._vmTag);
                }
            }
            _attr = attr;
        }
        return _attr;
    }

    private _parseWatchPath(watchPath: string | string[], tag: string) {
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

    private _getFullWatchPath(target: object, propertyKey: PropertyKey) {
        let parent = target;
        let objectName = "";
        let pathArr = [propertyKey];
        while (parent) {
            objectName = objectNameMap.get(parent); // 先获取对象名称（属性名）
            parent = depsMap.get(parent); // 获取被依赖的数据
            pathArr.unshift(objectName); // 最前面插入名称
        }

        let pathStr = pathArr.join(".");
        return pathStr;
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
        let deleted = this._mvMap.delete(tag);
        if (!deleted) {
            console.warn(`_mvvm-> 不存在 ${tag} 数据`);
        }
    }

    private _trigger(target: object, type: TriggerOpTypes, key, newValue, oldValue) {
        let watchPath = this._getFullWatchPath(target, key);

    }

    private static _instance: VM = null
    public static getInstance(): VM {
        if (!this._instance) {
            this._instance = new VM();
        }
        return this._instance;
    }
}

tnt.vm = VM.getInstance();

export { };