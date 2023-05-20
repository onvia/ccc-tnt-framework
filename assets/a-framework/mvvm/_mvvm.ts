import { CCObject, Component, Label, ValueType, Node, Sprite, EditBox, ProgressBar, RichText, Slider, Toggle, UIOpacity, UIRenderer, js } from "cc";



type VMTweenValueResults = (newValue: any, oldValue: any, path: any) => void;
interface IVMTween {
    onEnable();
    onDestroy();
    execTransition(newValue: any, oldValue: any, path: any, resolve: VMTweenValueResults);
}

type WatchPath = string | string[];
type ReturnValue = string | number | boolean | CCObject | ValueType;

type FormatorOpts = { newValue: any, oldValue?: any, node?: Node, nodeIdx?: number, watchPath?: WatchPath };
type Formator<T> = (options: FormatorOpts) => T | Promise<T>;

type ObserveAttr<T> = WatchPath | Formator<T> | {
    watchPath: WatchPath;
    tween?: IVMTween;
    formator?: Formator<T>;
}

type AttrBind<T> = {
    [P in keyof T]?: ObserveAttr<T[P]>;
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

const reactiveMap = new WeakMap<Target, any>();

// 防止重复注册
const proxySet = new WeakSet();


class VM {
    private _defObserverKey: WeakMap<Object, string> = new WeakMap();

    private static id = 0;
    public VMTag(target: IMVVM) {
        if (!target._vmTag) {
            target._vmTag = `VM-AUTO-${VM.id}`;
            VM.id++;
        }
    }


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

        let proxy = this.reactive(_data);
        if (_target) {
            _target.data = proxy;
        }


    }

    public reactive<T extends object>(target: T): T {
        return this._reactive(target);
    }

    public _reactive<T extends object>(data: T): T {
        if(proxySet.has(data)){
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
                    console.log(`_mvvm->【读取】${String(key)} 值为 ${res?.toString()} 注册代理`);
                    return self._reactive(res as object);
                }
                console.log(`_mvvm->【读取】 ${String(key)}  不用注册代理`);
                return res;
            },
            set(target, key: PropertyKey, newValue, receiver?: any) {
                let oldValue = target[key];

                const hadKey =
                    _isArray(target) && _isIntegerKey(key)
                        ? Number(key) < target.length
                        : hasOwn(target, key)

                const res = Reflect.set(target, key, newValue, receiver);
                if (!hadKey) {
                    // trigger(target,key) // 触发数据变化  增加
                }
                if (_hasChanged(newValue, oldValue)) {
                    // trigger(target,key) // 触发数据变化  修改
                }

                console.log(`_mvvm-> 【设置】${String(key)} 值为： ${newValue}`);
                return res;
            },
            deleteProperty(target, key: PropertyKey) {
                console.log(`_mvvm-> 【删除】${String(key)}`);
                const hadKey = hasOwn(target, key)
                const result = Reflect.deleteProperty(target, key);
                if (result && hadKey) {
                    // trigger(target,key) // 触发数据变化 删除
                }
                return result;
            }
        });

        reactiveMap.set(data, proxy);
        proxySet.add(proxy);
        return proxy;
    }


    public bind<T>(target: IMVVM, component: T, attr: AttrBind<T> | WatchPath, formator?: Formator<ReturnValue>) {
        let _attr = this._parseAttr(component, attr, formator);
        
    }

    public label(target: IMVVM, label: Label | Node, attr: AttrBind<Label> | WatchPath, formator?: Formator<string>) {
        let _label: Label = this._typeTransition(label, Label);
        let _attr = this._parseAttr(label, attr, formator);
        this.bind(target, _label, _attr, formator);
    }
    private getObserverKey(component: Object) {
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

    private _parseAttr<T>(component: T, attr: AttrBind<T> | WatchPath, formator?: Formator<ReturnValue>) {
        let _attr: AttrBind<any> = null;
        if (typeof attr === 'string' || _isArray(attr)) {
            let defKey = this.getObserverKey(component);
            _attr = {
                [defKey]: {
                    watchPath: attr,
                    formator: formator
                }
            }
        } else {
            _attr = attr;
        }

        return _attr;
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