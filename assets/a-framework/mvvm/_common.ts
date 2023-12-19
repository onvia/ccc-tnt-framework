import { Node, Button, EditBox, Label, ProgressBar, RichText, Slider, sp, Sprite, Toggle, UIOpacity, UIRenderer, UITransform, SpriteFrame, js } from "cc";
import { DEBUG } from "cc/env";
import { isArray } from "./VMGeneral";
import { CustomAttrBind, Formatter, ReturnValueType, VMBaseAttr, WatchPath } from "./_mv_declare";

const defaultComponentProperty: WeakMap<Object, string> = new WeakMap();
defaultComponentProperty.set(Label, "string");
defaultComponentProperty.set(RichText, "string");
defaultComponentProperty.set(EditBox, "string");
defaultComponentProperty.set(Sprite, "spriteFrame");
defaultComponentProperty.set(ProgressBar, "progress");
defaultComponentProperty.set(Slider, "progress");
defaultComponentProperty.set(Toggle, "isChecked");
defaultComponentProperty.set(Node, "active");
defaultComponentProperty.set(UIOpacity, "opacity");
defaultComponentProperty.set(UIRenderer, "color");
defaultComponentProperty.set(UITransform, "contentSize");
defaultComponentProperty.set(Button, "interactable");
defaultComponentProperty.set(sp.Skeleton, "skeletonData");


// 默认的格式化方法
const _defaultFormatter: WeakMap<Object, Record<string, Formatter<any, any>>> = new WeakMap();

// 注册 Sprite 默认格式化 spriteFrame 的方法
registerDefaultFormatter(Sprite, "spriteFrame", async (options) => {
    let spriteFrame = await new Promise<SpriteFrame>((rs) => {
        if (!options.newValue) {
            rs(null);
            return;
        }
        tnt.resourcesMgr.load(options.attr.loaderKey, options.newValue, SpriteFrame, (err, spriteFrame) => {
            rs(err ? null : spriteFrame);
        }, options.attr.bundle);
    });
    return spriteFrame;
});
// 注册 Spine 默认格式化 skeletonData 的方法
registerDefaultFormatter(sp.Skeleton, "skeletonData", async (options) => {
    let skeletonData = await new Promise<sp.SkeletonData>((rs) => {
        if (!options.newValue) {
            rs(null);
            return;
        }
        tnt.resourcesMgr.load(options.attr.loaderKey, options.newValue, sp.SkeletonData, (err, skeletonData) => {
            rs(err ? null : skeletonData);
        }, options.attr.bundle);
    });
    return skeletonData;
});


function getDefaultComponentProperty(component: Object) {
    let defKey = "string";
    let clazz = js.getClassByName(js.getClassName(component));
    if (defaultComponentProperty.has(clazz)) {
        defKey = defaultComponentProperty.get(clazz);
    }
    return defKey;
}
/**
 *  注册组件默认属性
 *
 * @param {GConstructor<any>} clazz
 * @param {string} property
 */
function registerDefaultComponentProperty(clazz: GConstructor<any>, property: string) {
    defaultComponentProperty.set(clazz, property);
}
/**
 * 注册默认格式化方法
 *
 * @template T
 * @param {GConstructor<T>} clazz
 * @param {Formatter<any, any>} formatter
 * @return {*} 
 */
function registerDefaultFormatter<T>(clazz: GConstructor<T>, property: string, formatter: Formatter<any, any>) {
    if (!clazz || !formatter) {
        return;
    }
    let obj = _defaultFormatter.get(clazz);
    if (!obj) {
        obj = {};
    }
    obj[property] = formatter;
    _defaultFormatter.set(clazz, obj);
}
function getDefaultFormatter(component: Object, property: string) {
    let defFormatter = null;
    let clazz = js.getClassByName(js.getClassName(component));
    if (_defaultFormatter.has(clazz)) {
        let defFormatterMap = _defaultFormatter.get(clazz);
        defFormatter = defFormatterMap?.[property];
    }
    return defFormatter;
}

function formatAttr<T>(mvvmObject: IMVVMObject, component: T, attr: CustomAttrBind<T> | WatchPath, formatter?: Formatter<ReturnValueType, unknown>) {
    let _attr: CustomAttrBind<any> = null;
    if (typeof attr === 'string' || isArray(attr)) {
        let defKey = getDefaultComponentProperty(component);
        _attr = {
            [defKey]: {
                _targetPropertyKey: defKey,
                watchPath: parseWatchPath(attr, mvvmObject._vmTag),
                formatter: formatter || getDefaultFormatter(component, defKey)
            }
        }
    } else {
        for (const key in attr) {
            const element = attr[key];
            if (typeof element === 'string' || isArray(element)) {
                let observeAttr: VMBaseAttr<any> = {
                    watchPath: parseWatchPath(element as string, mvvmObject._vmTag),
                    formatter: getDefaultFormatter(component, key),
                    _targetPropertyKey: key,
                }
                attr[key] = observeAttr;
            } else {
                element.watchPath = parseWatchPath(element.watchPath, mvvmObject._vmTag);
                element._targetPropertyKey = key;
                if (!element.formatter) {
                    element.formatter = getDefaultFormatter(component, key)
                }
            }
        }
        _attr = attr;
    }
    return _attr;
}
function parseWatchPath(watchPath: string | string[], tag: string) {
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

export {
    registerDefaultComponentProperty,
    getDefaultComponentProperty,
    registerDefaultFormatter,
    getDefaultFormatter,
    formatAttr,
    parseWatchPath
}