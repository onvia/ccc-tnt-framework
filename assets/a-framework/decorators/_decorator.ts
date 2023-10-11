import { Component, js, Label, Button, Layout, ProgressBar, EditBox, Sprite, Graphics, RichText, Toggle, _decorator, Widget, Slider, ScrollView } from "cc";
import { DEV, EDITOR } from "cc/env";

/**
 * 装饰器相关功能，用于添加组件、插件等装饰器。
 */

// type PolymorphismOptions = {
//     types: Array<[new () => { constructor: Function; }, string]>;
//     displayName?: string;
// };

/**
 * 按钮属性选项
 */
type ButtonPropertyOptions = {
    soundName?: string;
}

/**
 * 插件管理器接口，用于注册插件
 */
interface IPluginMgr<T> {
    registerPluginAuto(plugin: T);
}

/**
 * 全局声明扩展接口，用于定义插件类型
 */
declare global {
    interface IPluginType {
        // [mgrName: string]: any;
    }
}

/**
 * 插件管理器映射表，用于存储插件管理器
 */
let __pluginMgrMap: Map<string, IPluginMgr<any>> = new Map();

/**
 * 插件映射表，用于存储插件类的数组
 */
let __pluginMap: Map<string, any[]> = new Map();

/**
 * 是否已经注册插件的标志
 */
let __isRegisterPlugin = false;

/**
 * 组件装饰器，用于添加声音属性到组件中
 * @param name 声音属性名
 * @param type 组件类型
 * @param parent 父节点名或按钮属性选项
 * @param options 按钮属性选项
 */
function _component_sound(name?: string, type?: GConstructor<Component>, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions) {
    return (target: any, propertyKey: string) => {
        let _parent = parent as string;
        if (!options && typeof parent == "object") {
            options = parent;
            _parent = null;
        }
        __decorator.component(name, type, _parent)(target, propertyKey);
        CommonPropertyDecorator("__$$50btnSounds__", _class_sound_attrs, name, options)(target, propertyKey);
    }
}


let _extends = {};
let _class_node_attrs = {};
let _class_component_attrs = {};
let _class_sound_attrs = {};
let _target__ = {};
let __classIdx = 0;

function checkClassTag(target) {
    if (target.constructor._$50classTag === undefined || _target__[target.constructor._$50classTag] != target) {
        target.constructor._$50classTag = `${__classIdx}`;
        _target__[target.constructor._$50classTag] = target;
        __classIdx++;
    }
    return target.constructor._$50classTag;
}

function _assign(target, source) {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (key in target) {
                continue;
            }
            target[key] = source[key];
        }
    }
}
function assign(target, ...sources) {
    for (let i = 0; i < sources.length; i++) {
        _assign(target, sources[i]);
    }
}

/** 需要往组件类上声明属性的可以用这个通用的装饰器 */
function CommonPropertyDecorator(attrName: string, _classAttrs: Record<string, any>, key?: string, obj?: any) {
    return (target: any, propertyKey: string) => {

        let _className = target.constructor.name;

        _className = checkClassTag(target);

        !_classAttrs[_className] && (_classAttrs[_className] = {});

        if (!key) {
            key = propertyKey;
        }

        let _classObj = _classAttrs[_className];
        _classObj[propertyKey] = Object.assign({
            name: key,
        }, obj || {});

        var base = js.getSuper(target.constructor);
        (base === Object || base === Object || base === Component) && (base = null);
        if (base) {

            let parent = checkClassTag(base.prototype);
            !_extends[_className] && (_extends[_className] = parent);

            var _super = js.getSuper(base);
            let superIdx = 1;
            while (_super) {
                if (_super === Object || _super === Object || _super === Component) {
                    _super = null;
                    break;
                }
                let superTag = checkClassTag(_super.prototype);
                !_extends[parent] && (_extends[parent] = superTag);
                _super = js.getSuper(_super);
                superIdx++;
            }

            while (parent) {
                if (parent in _classAttrs) {
                    assign(_classObj, _classAttrs[parent]);
                }
                parent = _extends[parent];
            }
        }
        target[attrName] = _classAttrs[_className] = _classObj;
    }
}


/**
 * 补充注册插件
 * @param pluginName 插件名称
 */
function __registerPlugins(pluginName: string) {
    if (!__isRegisterPlugin) {
        return;
    }
    let mgr = __pluginMgrMap.get(pluginName);
    let plugins = __pluginMap.get(pluginName);
    if (!mgr || !plugins?.length) {
        return;
    }

    if (mgr.registerPluginAuto) {
        console.warn(`插件管理器【${pluginName}】 请实现 registerPluginAuto 静态方法`);
    }

    for (let i = 0; i < plugins.length; i++) {
        const ctor = plugins[i];
        let ins = new ctor();
        mgr.registerPluginAuto(ins);
        console.log(`后加载插件 ${pluginName}： ${js.getClassName(ctor)}`);
    }
    plugins.length = 0;
}

/**
 * 统一注册插件
 */
function _registerPlugins() {
    if (__isRegisterPlugin) {
        return;
    }
    __isRegisterPlugin = true;
    console.log(`_decorator-> 注入所有插件`);
    __pluginMgrMap.forEach((target, key) => {
        if (!target.registerPluginAuto) {
            console.warn(`插件管理器【${key}】 请实现 registerPluginAuto 静态方法`);
            return;
        }
        if (__pluginMap.has(key)) {
            let plugins = __pluginMap.get(key);
            for (let i = 0; i < plugins.length; i++) {
                const ctor = plugins[i];
                let ins = new ctor();
                target.registerPluginAuto(ins);
                console.log(`正常加载插件 ${key} ： ${js.getClassName(ctor)}`);
            }
            plugins.length = 0;
        } else {
            console.warn(`【${key}】没有任何插件`);
        }
    });
}

/**
 * 装饰器对象，包含各种组件和功能装饰器
 */
let __decorator = {

    /**
     * 插件管理器装饰器
     * @param name 插件管理器名称，枚举值需要实现 IPluginType 接口
     */
    pluginMgr<T extends string & keyof IPluginType>(name: T) {
        return (target: any) => {
            if (EDITOR) {
                return;
            }
            console.log(`_decorator-> ${name} 变身成为插件管理类`);

            // 注入 注册方法
            if (!target.registerPluginAuto) {
                target.___plugins = [];
                target.registerPluginAuto = (plugins: IPluginCommon | IPluginCommon[]) => {
                    if (!Array.isArray(plugins)) {
                        plugins = [plugins];
                    }

                    plugins.forEach((plugin) => {
                        //插件能不重复
                        let findPlugin = target.___plugins.find(item => item.name === plugin.name || item === plugin);
                        if (findPlugin) {
                            console.log(`${name}-> 已存在相同名称的插件 ${plugin.name}`);
                            return;
                        }

                        //执行插件注册事件
                        target.___plugins.push(plugin);
                        plugin.onPluginRegister?.();
                    });

                    target.___plugins.sort((a, b) => {
                        return (b.priority || 0) - (a.priority || 0);
                    });
                }

                target.unregisterPlugin = (plugin: IPluginCommon | string) => {
                    for (let i = 0; i < target.___plugins.length; i++) {
                        const element = target.___plugins[i];

                        if ((typeof plugin === 'string' && element.name === plugin)
                            || (typeof plugin === 'object' && element.name === plugin.name)) {
                            target.___plugins.splice(i, 1);
                            element.onPluginUnRegister?.();
                        }
                    }
                }

                target.prototype.registerPlugin = (plugins: IPluginCommon | IPluginCommon[]) => {
                    target.registerPluginAuto(plugins);
                }
                target.prototype.unregisterPlugin = (plugin: IPluginCommon | string) => {
                    target.unregisterPlugin(plugin);
                }

            }

            __pluginMgrMap.set(name, target);

            // 检查是否有可以注册的插件
            __registerPlugins(name);
        }
    },

    /**
     * 插件装饰器
     * @param name 插件名称，枚举值需要实现 IPluginType 接口
     */
    plugin: function <T extends string & keyof IPluginType>(name: T) {
        return (target: any) => {
            if (EDITOR) {
                return;
            }
            let _plugins: any[] = null;
            if (!__pluginMap.has(name)) {
                _plugins = [];
                __pluginMap.set(name, _plugins)
            } else {
                _plugins = __pluginMap.get(name);
            }
            _plugins.push(target);

            console.log(`_decorator-> ${name} 增加插件 ${js.getClassName(target)}`);

            // 检查是否可以注册插件
            __registerPlugins(name);
        }
    },
    _registerPlugins: _registerPlugins,

    /**
     * UI 的预制体路径装饰器
     * @param prefabUrl 可根据情况使用不同的资源路径
     * @param bundle
     */
    prefabUrl(prefabUrl: string | ((param?: any) => string), bundle?: string | ((param?: any) => string)) {
        return (target: Function) => {
            //@ts-ignore
            target.__$prefabUrl = prefabUrl;
            target.prototype.prefabUrl = prefabUrl;

            //@ts-ignore
            target.__$bundle = bundle;
            target.prototype.bundle = bundle;
        };
    },

    /**
     * 节点属性装饰器
     * @param name 节点属性名
     * @param parent 父节点名
     */
    node(name?: string, parent?: string) {
        return CommonPropertyDecorator("__$$50nodes__", _class_node_attrs, name, { parent });
    },

    // 其他组件的装饰器

    /**
     * slider 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    slider(name?: string, parent?: string) {
        return __decorator.component(name, Slider, parent)
    },

    /**
     * progressBar 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    progressBar(name?: string, parent?: string) {
        return __decorator.component(name, ProgressBar, parent)
    },

    /**
     * layout 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    layout(name?: string, parent?: string) {
        return __decorator.component(name, Layout, parent)
    },

    /**
     * editBox 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    editBox(name?: string, parent?: string) {
        return __decorator.component(name, EditBox, parent)
    },

    /**
     * label 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    label(name?: string, parent?: string) {
        return __decorator.component(name, Label, parent)
    },

    /**
     * sprite 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    sprite(name?: string, parent?: string) {
        return __decorator.component(name, Sprite, parent)
    },

    /**
     * graphics 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    graphics(name?: string, parent?: string) {
        return __decorator.component(name, Graphics, parent)
    },

    /**
     * richText 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    richText(name?: string, parent?: string) {
        return __decorator.component(name, RichText, parent)
    },

    /**
     * widget 组件装饰器
     * @param name 组件名
     * @param parent 父节点名
     */
    widget(name?: string, parent?: string) {
        return __decorator.component(name, Widget, parent)
    },

    /**
     * toggle 组件装饰器
     * @param name 组件名
     * @param parent 父节点名或按钮属性选项
     * @param options 按钮属性选项
     */
    toggle(name?: string, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions,) {
        return _component_sound(name, Toggle, parent, options);
    },

    /**
     * button 组件装饰器
     * @param name 组件名
     * @param parent 父节点名或按钮属性选项
     * @param options 按钮属性选项
     */
    button(name?: string, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions) {
        return _component_sound(name, Button, parent, options);
    },

    /**
     * scrollView 组件装饰器
     * @param name 组件名
     * @param parent 父节点名或按钮属性选项
     * @param options 按钮属性选项
     */
    scrollView(name?: string, parent?: string) {
        return __decorator.component(name, ScrollView, parent)
    },

    /**
     * 组件装饰器，用于给组件添加属性
     * @param name 属性名或组件名
     * @param type 组件类型或属性类型
     * @param parent 父节点名
     */
    component(name?: string | GConstructor<Component>, type?: GConstructor<Component>, parent?: string) {
        let key = null;
        if (name) {
            if (typeof name == "string") {
                key = name;
            }
        }
        return CommonPropertyDecorator("__$$50components__", _class_component_attrs, key, { type, parent });
    },
    /**
     * 非序列化装饰器，用于标记属性不会被序列化
     */
    nonserialization() {
        return (target: any, propertyKey: string) => {
            if (!target.__unserialization) {
                target.__unserialization = [];
            }
            target.__unserialization.push(propertyKey);

            if (!target.toJSON) {
                // JSON.stringify 自动调用
                target.toJSON = function () {
                    let data: Record<any, any> = {};
                    for (const key in this) {
                        if (Object.prototype.hasOwnProperty.call(this, key)) {
                            // @ts-ignore
                            if (this.__unserialization.indexOf(key) !== -1) {
                                continue;
                            }
                            const value = this[key];
                            data[key] = value;
                        }
                    }
                    return data;
                }
            }
        }
    },

    /**
     * 方法装饰器，用于查看方法运行时间
     * @param tag 标记方法的运行时间
     */
    time(tag: string) {
        return (target: any,
            propertyKey: string,
            descriptor: TypedPropertyDescriptor<any>) => {
            const oldValue = descriptor.value

            descriptor.value = function (...rest: any[]) {
                console.time(tag)
                oldValue.apply(target, rest)
                console.timeEnd(tag)
            }

            return descriptor
        }
    },

    // // 多态
    // polymorphism({ types, displayName }: PolymorphismOptions): PropertyDecorator {
    //     return (target, propertyKey: PropertyKey) => {
    //         if (typeof propertyKey !== 'string') {
    //             throw new Error(`Only string named fields are supported.`);
    //         }

    //         const typePropertyKey = `${propertyKey}__type`;

    //         type This = {
    //             [x: typeof propertyKey]: {
    //                 constructor: Function;
    //             };
    //         };

    //         const typePropertyDescriptor: PropertyDescriptor = {
    //             get(this: This) {
    //                 const currentValue = this[propertyKey];
    //                 const typeIndex = types.findIndex(([constructor]) => currentValue.constructor === constructor);
    //                 if (typeIndex < 0) {
    //                     throw new Error(`${currentValue} is not a registered type.`);
    //                 }
    //                 return typeIndex;
    //             },

    //             set(this: This, value: number) {
    //                 const [constructor] = types[value];
    //                 if (this[propertyKey].constructor === constructor) {
    //                     return;
    //                 }
    //                 const object = new constructor();
    //                 this[propertyKey] = object;
    //             }
    //         };

    //         const typeEnums = types.reduce((result, [constructor, name], index) => {
    //             result[name] = index;
    //             return result;
    //         }, {} as Record<string, number>);
    //         ccenum(typeEnums);

    //         _decorator.property({
    //             displayName: displayName ?? `Type of ${propertyKey}`,
    //             type: typeEnums,
    //         })(target, typePropertyKey, typePropertyDescriptor);

    //         Object.defineProperty(target, typePropertyKey, typePropertyDescriptor);
    //     };
    // },



    // logClassFunc() {
    //     return function (target: any) {
    //         const className = target.prototype.constructor?.name || 'No Name';
    //         const propNames = Object.getOwnPropertyNames(target.prototype);
    //         for (let i = 0; i < propNames.length; ++i) {
    //             const prop = propNames[i];
    //             if (prop !== 'constructor') {
    //                 const desc = Object.getOwnPropertyDescriptor(target.prototype, prop);
    //                 const func = desc && desc.value;
    //                 if (typeof func === 'function') {
    //                     let oldFunc = (func as Function);
    //                     target.prototype[prop] = function () {
    //                         console.log(`[${className}] [${prop}] Begin`, ...arguments);
    //                         let val = oldFunc.call(this, ...arguments)
    //                         console.log(`[${className}] [${prop}] End`);
    //                         return val;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },


    // clazz(name: string) {
    //     return (target: Function) => {
    //         console.log(`_decorator-> 类装饰器  clazz ${name}`);
    //     };
    // },

    // func<T>(name: string) {
    //     return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    //         console.log(`_decorator-> 方法装饰器 func ${name} propertyKey: ${propertyKey}`);
    //     };
    // },

    // accessor(name: string) {
    //     return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    //         console.log(`_decorator-> 访问器装饰器 accessor ${name} propertyKey: ${propertyKey}`);
    //     };
    // },

    // prop<T>(name: string) {
    //     return function (target: any, propertyKey: string) {
    //         console.log(`_decorator-> 属性装饰器 prop ${name}  propertyKey: ${propertyKey}`);
    //     };
    // },

    // // 特殊要求： 必须在 @ccclass 之后调用
    //  classTest(){
    //     // if(EDITOR){
    //     //     // 
    //     //     return (constructor: Function)=>{
    //     //     }
    //     // }
    //     return <T extends { new(...args: any[]): Component }>(constructor: T) => {

    //         // 修复 使用类装饰器之后 导致 node.getComponent(组件基类) 返回值 为空的情况
    //         // 代表性示例为 UIMgr 需要获取 UIViewBase 
    //         var base = js.getSuper(constructor);
    //         base === CCObject && (base = null);
    //         if(base){
    //             // @ts-ignore
    //             base._sealed = false;
    //         }

    //         return class extends constructor{
    //             onLoad(){
    //                 super.onLoad && super.onLoad();
    //                 console.log(`_decorator-> onLoad`);
    //             }
    //             start(){
    //                 super.start && super.start();
    //                 console.log(`_decorator-> start`);

    //             }
    //             onDestroy(){
    //                 super.onDestroy && super.onDestroy();
    //                 console.log(`_decorator-> onDestroy`);
    //             }

    //             onEnable(){
    //                 super.onEnable && super.onEnable();
    //                 console.log(`_decorator-> onEnable,${this.name}`);
    //             }
    //             onDisable(){
    //                 console.log(`_decorator-> onDisable`);
    //             }    

    //         }
    //     }
    // }
}

/**
 * 全局声明扩展接口，添加 _decorator 对象
 */
declare global {
    interface ITNT {
        _decorator: typeof __decorator;
    }
}

/**
 * 将 _decorator 对象添加到全局 ITNT 接口中
 */
tnt._decorator = __decorator;
