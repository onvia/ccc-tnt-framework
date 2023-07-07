import { Component, js, Label, Button, Layout, ProgressBar, EditBox, Sprite, Graphics, RichText, Toggle, _decorator, Widget, Slider } from "cc";
import { DEV, EDITOR } from "cc/env";


// type PolymorphismOptions = {
//     types: Array<[new () => { constructor: Function; }, string]>;
//     displayName?: string;
// };

type ButtonPropertyOptions = {
    soundName?: string;
}

interface IPluginMgr<T> {
    registerPluginAuto(plugin: T);
}

declare global {
    interface IPluginType {
        // [mgrName: string]: any;
    }

}

let __pluginMgrMap: Map<string, IPluginMgr<any>> = new Map();
let __pluginMap: Map<string, any[]> = new Map();
let __isRegistedPlugin = false;


function _component_sound(name?: string, type?: GConstructor<Component>, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions) {
    return (target: any, propertyKey: string) => {
        if (!options && typeof parent == "object") {
            options = parent;
            parent = null;
        }
        target.__$$50components__ = target.__$$50components__ || {};
        target.__$$50components__[propertyKey] = { name: name ?? propertyKey, parent, propertyKey, type };
        if (options?.soundName) {
            target.__$$50btnSounds__ = target.__$$50btnSounds__ || {};
            target.__$$50btnSounds__[propertyKey] = options?.soundName;
        }
    }
}

/**
 * 补充注册插件
 *
 * @param {string} pluginName
 * @return {*} 
 */
function __registePlugins(pluginName: string) {
    if (!__isRegistedPlugin) {
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
 *
 * @return {*} 
 */
function _registePlugins() {
    if (__isRegistedPlugin) {
        return;
    }
    __isRegistedPlugin = true;
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

let __decorator = {

    /**
     * 枚举值请实现 interface IPuginType{ }
     *
     * @export
     * @template T
     * @param {T} name
     * @return {*} 
     */
    pluginMgr<T extends string & keyof IPluginType>(name: T) {
        return (target: any) => {
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
            __registePlugins(name);
        }
    },


    /**
     * 枚举值 请实现 interface IPuginType{ }
     *
     * @export
     * @template T
     * @param {T} name
     * @return {*} 
     */
    plugin: function <T extends string & keyof IPluginType>(name: T) {

        return (target: any) => {
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
            __registePlugins(name);
        }
    },
    _registePlugins: _registePlugins,

    /**
     * UI 的预制体路径
     * @param prefabUrl 可根据情况使用不同的资源路径 
     * @param bundle 
     * @returns 
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

    node(name?: string, parent?: string) {
        return (target: any, propertyKey: string) => {

            target.__$$50nodes__ = target.__$$50nodes__ || {};
            target.__$$50nodes__[propertyKey] = { name: name ?? propertyKey, parent, propertyKey };
        }
    },

    slider(name?: string, parent?: string) {
        return __decorator.component(name, Slider, parent)
    },
    progressBar(name?: string, parent?: string) {
        return __decorator.component(name, ProgressBar, parent)
    },
    layout(name?: string, parent?: string) {
        return __decorator.component(name, Layout, parent)
    },
    editBox(name?: string, parent?: string) {
        return __decorator.component(name, EditBox, parent)
    },
    label(name?: string, parent?: string) {
        return __decorator.component(name, Label, parent)
    },
    sprite(name?: string, parent?: string) {
        return __decorator.component(name, Sprite, parent)
    },
    graphics(name?: string, parent?: string) {
        return __decorator.component(name, Graphics, parent)
    },
    richText(name?: string, parent?: string) {
        return __decorator.component(name, RichText, parent)
    },
    widget(name?: string, parent?: string) {
        return __decorator.component(name, Widget, parent)
    },


    toggle(name?: string, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions,) {
        return _component_sound(name, Toggle, parent, options);
    },

    button(name?: string, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions) {
        return _component_sound(name, Button, parent, options);
    },

    //  component(type: Constructor<Component>,parent?: string)
    //  component(name: string,type: Constructor<Component>,parent?: string)
    component(name: string | GConstructor<Component>, type?: GConstructor<Component> | string, parent?: string) {
        return (target: any, propertyKey: string) => {

            if (type && typeof type != "string") {
                if (!name) {
                    name = propertyKey;
                }
            } else {
                if (typeof name !== "string") {
                    if (typeof type == 'string') {
                        parent = type;
                    }
                    type = name;
                    name = propertyKey;
                }
            }

            if (!type) {
                throw new Error("需要组件类型");
            }
            target.__$$50components__ = target.__$$50components__ || {};
            target.__$$50components__[propertyKey] = { name: name ?? propertyKey, parent, propertyKey, type };
        }
    },

    /** 禁止序列化 */
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


    //方法装饰器 查看方法运行时间
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



declare global {
    interface ITNT {
        _decorator: typeof __decorator;
    }
}

tnt._decorator = __decorator;