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



function component_sound(name?: string, type?: GConstructor<Component>, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions) {
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
            __pluginMgrMap.set(name, target);
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
        }
    },

    /**
     * 无需手动调用
     */
    _registePlugins() {
        __pluginMgrMap.forEach((target, key) => {
            if (__pluginMap.has(key)) {
                let plugins = __pluginMap.get(key);
                for (let i = 0; i < plugins.length; i++) {
                    const ctor = plugins[i];
                    if (target.registerPluginAuto) {
                        let ins = new ctor();
                        target.registerPluginAuto(ins);
                        if (DEV) {
                            console.log(`${key} 加载插件 ${js.getClassName(ctor)}`);
                        }
                    } else {
                        console.warn(`插件管理器【${key}】 请实现 registerPluginAuto 静态方法`);
                        break;
                    }
                }
            } else {
                console.warn(`【${key}】没有任何插件`);
            }
        });
    },

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
        return component_sound(name, Toggle, parent, options);
    },

    button(name?: string, parent?: string | ButtonPropertyOptions, options?: ButtonPropertyOptions) {
        return component_sound(name, Button, parent, options);
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

    /** 禁用运行时执行方法 */
    disableRuntime(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        const oldValue = descriptor.value
        if (!EDITOR) {
            descriptor.value = function (...rest: any[]) {
            }
        }
        return descriptor
    },

    /** 禁用编辑器执行方法 */
    disableEditor(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        const oldValue = descriptor.value
        if (EDITOR) {
            descriptor.value = function (...rest: any[]) {
            }
        }
        return descriptor
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