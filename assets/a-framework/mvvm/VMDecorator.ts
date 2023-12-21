
import { Node, CCObject, Component, js, __private, Button, Label, ProgressBar, Sprite, Slider, UIRenderer, UITransform, UIOpacity, SpriteFrame, RichText, EditBox, Toggle, Color, Size, sp, Asset, Renderer, CCClass, instantiate } from "cc";
import { DEBUG, EDITOR } from "cc/env";
import { BaseValueType, CustomAttrBind, DataChanged, Formatter, LabelAttrBind, ReturnValueType, SkinAttrBind, VMForAttr, WatchPath } from "./_mv_declare";

type DecoratorCompData = { attr: CustomAttrBind<any> | WatchPath, formatter: Formatter<ReturnValueType, unknown>, ctor: GConstructor<any> };
type DecoratorForData = VMForAttr;
type DecoratorEventData = { watchPath: WatchPath, formatter: DataChanged };

enum eVMFuncType {
    Comp, For, Event
}

type FuncDataMap = {
    [eVMFuncType.Comp]: DecoratorCompData;
    [eVMFuncType.For]: DecoratorForData;
    [eVMFuncType.Event]: DecoratorEventData;
};

type DecoratorData<T extends eVMFuncType> = { propertyKey: string, funcType: T, data: FuncDataMap[T] };



const CCCLASS_TAG = '__ctors__'; // Still use this historical name to avoid unsynchronized version issue
const VM_CLASS_TAG = '__vm_ctors__';
/**
 * mvvm 装饰器
 * - 特殊要求： 推荐在 @ccclass 之后添加 例如：
 *  @ccclass
 * - @mvvm()
 * - class UIView { }
 * @param _tagOrDelay //唯一 标签  | 延迟注册
 * @param _delay // 延迟注册
 */

function mvvm(_tagOrDelay?: string | number, _delay?: number) {

    return <T extends { new(...args: any[]): Component }>(constructor: T) => {
        if (EDITOR) {
            return constructor;
        }
        let isCCClass = constructor.hasOwnProperty(CCCLASS_TAG);

        // 修复 使用类装饰器之后 导致 node.getComponent(组件基类) 返回值 为空的情况
        var base = js.getSuper(constructor);

        // let _bind50Data = constructor["_vmDecoratorDataArray"];
        // if (_bind50Data) {
        //     console.log(`VMDecorator-> `);
        // }

        let isVMClass = base?.hasOwnProperty(VM_CLASS_TAG);
        if (isVMClass) {
            js.value(constructor, VM_CLASS_TAG, true, true);
            return constructor;
        }
        base === CCObject && (base = null);
        if (base) {
            base._sealed = false;
        }

        let clazz = class extends constructor {

            // declare _vmDecoratorDataArray: DecoratorData<eVMFuncType>[];

            public _vmTag: string = null;
            public _initVMTag() {
                if (!this._vmTag) {
                    if (_tagOrDelay && typeof _tagOrDelay === 'number') {
                        _delay = _tagOrDelay;
                        _tagOrDelay = undefined;
                    }
                    this._vmTag = _tagOrDelay as string || tnt.vm.VMTag(this);
                }
            }


            // 只有观察 本类里的数据的时候才会有 data 属性，
            // 如果没有 data 则不注册观察事件
            declare data;

            // onLoad() {
            //     super.onLoad?.();
            // }
            // start() {
            //     super.start?.();
            // }

            onEnable() {
                this._initVMTag();
                tnt.vm.observe(this);

                super.onEnable?.();
                if (_delay != undefined) {
                    this.scheduleOnce(this._vmBind, _delay);
                    return;
                }
                this._vmBind();
            }

            onDisable() {
                tnt.vm.violate(this);
                super.onDisable?.();
            }

            // onDestroy() {
            //     super.onDestroy?.();
            // }

            _vmBind() {
                let comp = this.constructor;
                // @ts-ignore
                let _vmDecoratorDataArray: DecoratorData<eVMFuncType>[] = comp._vmDecoratorDataArray?.data;


                if (!_vmDecoratorDataArray) {
                    console.log(`VMDecorator-> ${this.name} MVVM 装饰器数据不存在`);
                    return;
                }
                for (let key in _vmDecoratorDataArray) {
                    const decoratorData = _vmDecoratorDataArray[key];
                    let targetProperty = this[decoratorData.propertyKey];
                    // @ts-ignore
                    let ctor = decoratorData?.data?.ctor;
                    if (!targetProperty) {
                        DEBUG && console.log(`VMDecorator-> ${this.name} 对象不存在 ${decoratorData.propertyKey}，尝试自动绑定`);
                        let _ctor = ctor == Node ? null : ctor;
                        // @ts-ignore
                        this.bindNode?.(decoratorData.propertyKey, decoratorData.propertyKey, _ctor);

                        targetProperty = this[decoratorData.propertyKey];
                    }

                    // 取出正确的对象
                    if (ctor) {
                        if (js.getClassName(targetProperty) !== js.getClassName(ctor)) {
                            if (ctor === Node) {
                                targetProperty = targetProperty.node;
                            } else if (tnt.js.hasSuper(ctor, Component)) {
                                targetProperty = targetProperty.getComponent(ctor);
                            }
                        }
                    }

                    let copyData = instantiate(decoratorData.data); // 这里使用副本数据
                    switch (decoratorData.funcType) {
                        case eVMFuncType.Comp:
                            let compData = copyData as DecoratorCompData;

                            tnt.vm.bind(this, targetProperty, compData.attr, compData.formatter);
                            break;
                        case eVMFuncType.For:
                            let forData = copyData as DecoratorForData;
                            tnt.vm.for(this, targetProperty, forData);
                            break;
                        case eVMFuncType.Event:
                            let eventData = copyData as DecoratorEventData;
                            tnt.vm.event(this, eventData.watchPath, eventData.formatter);
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        if (isCCClass) {

            let className = js.getClassName(constructor);
            let base: any = constructor;
            const cls = define(className, constructor, clazz);

            cls._sealed = true;
            if (base) {
                base._sealed = false;
            }

            declareProperties(cls, base);
        }


        js.value(clazz, VM_CLASS_TAG, true, true);
        return clazz;
    }
}

function define(className, baseClass, ctor) {
    // @ts-ignore
    let frame = cc._RF.peek();

    if (frame && js.isChildClassOf(baseClass, Component)) {
        className = className || frame.script;
    }
    const cls = doDefine(className, baseClass, ctor);

    if (frame) {
        // 基础的 ts, js 脚本组件
        if (js.isChildClassOf(baseClass, Component)) {
            const uuid = frame.uuid;
            if (uuid) {
                js._setClassId(uuid, cls);
            }
            frame.cls = cls;
        } else if (!js.isChildClassOf(frame.cls, Component)) {
            frame.cls = cls;
        }
    }
    return cls;
}
function declareProperties(cls, baseClass) {
    cls.__props__ = [];
    if (baseClass && baseClass.__props__) {
        cls.__props__ = baseClass.__props__.slice();
    }
    let attributeUtils = CCClass.Attr;
    const attrs = attributeUtils.getClassAttrs(cls);
    cls.__values__ = cls.__props__.filter((prop) => attrs[`${prop + attributeUtils.DELIMETER}serializable`] !== false);
}

function doDefine(className, baseClass, ctor) {
    js.value(ctor, CCCLASS_TAG, true, true);
    if (baseClass) {
        ctor.$super = baseClass;
    }
    js.setClassName(className, ctor);
    return ctor;
}



function _VMBase(funcType: eVMFuncType, data: FuncDataMap[eVMFuncType]) {
    return function (target: any, propertyKey: string) {
        // !target._vmDecoratorDataArray && (target._vmDecoratorDataArray = []);
        // let _vmDecoratorDataArray: DecoratorData<eVMFuncType>[] = target._vmDecoratorDataArray;
        // _vmDecoratorDataArray.push({ propertyKey, funcType: funcType, data: data });

        tnt._decorator.__CommonPropertyDecorator("_vmDecoratorDataArray", propertyKey, { propertyKey, funcType: funcType, data: data })(target, propertyKey);
    }
}
// function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: A)
// function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: WatchPath)
// function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: WatchPath, formatter: Formatter<ReturnValueType, unknown>)
function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: A | WatchPath, formatter: Formatter<ReturnValueType, unknown>, ctor: GConstructor<T>)
function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: A | WatchPath, formatter?: Formatter<ReturnValueType, unknown>, ctor?: GConstructor<T>) {

    return _VMBase(eVMFuncType.Comp, { attr, formatter, ctor });
}

function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: CustomAttrBind<T>)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: WatchPath)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: WatchPath, formatter: Formatter<ReturnValueType, unknown>)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: CustomAttrBind<T> | WatchPath, formatter: Formatter<ReturnValueType, unknown>)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: CustomAttrBind<T> | WatchPath, formatter?: Formatter<ReturnValueType, unknown>) {
    return VMBase(attr, formatter, ctor);
}

function VMLabel(attr: LabelAttrBind<Label>)
function VMLabel(attr: WatchPath)
function VMLabel(attr: WatchPath, formatter: Formatter<BaseValueType, unknown>)
function VMLabel(attr: LabelAttrBind<Label> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
    return VMBase(attr, formatter, Label);
}

function VMRichText(attr: LabelAttrBind<RichText>)
function VMRichText(attr: WatchPath)
function VMRichText(attr: WatchPath, formatter: Formatter<BaseValueType, unknown>)
function VMRichText(attr: LabelAttrBind<RichText> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
    return VMBase(attr, formatter, RichText);
}


function VMNode(attr: CustomAttrBind<Node>)
function VMNode(attr: WatchPath)
function VMNode(attr: WatchPath, formatter: Formatter<boolean, unknown>)
function VMNode(attr: CustomAttrBind<Node> | WatchPath, formatter?: Formatter<boolean, unknown>) {
    return VMBase(attr, formatter, Node);
}


function VMSprite(attr: SkinAttrBind<Sprite>)
function VMSprite(attr: WatchPath)
function VMSprite(attr: WatchPath, formatter: Formatter<SpriteFrame, { bundle?: string, loaderKey: string }>)
function VMSprite(attr: SkinAttrBind<Sprite> | WatchPath, formatter?: Formatter<SpriteFrame, { bundle?: string, loaderKey: string }>) {
    return VMBase(attr, formatter, Sprite);
}

function VMProgressBar(attr: CustomAttrBind<ProgressBar>)
function VMProgressBar(attr: WatchPath)
function VMProgressBar(attr: WatchPath, formatter: Formatter<number, unknown>)
function VMProgressBar(attr: CustomAttrBind<ProgressBar> | WatchPath, formatter?: Formatter<number, unknown>) {
    return VMBase(attr, formatter, ProgressBar);
}

function VMSlider(attr: CustomAttrBind<Slider>)
function VMSlider(attr: WatchPath)
function VMSlider(attr: WatchPath, formatter: Formatter<number, unknown>)
function VMSlider(attr: CustomAttrBind<Slider> | WatchPath, formatter?: Formatter<number, unknown>) {
    return VMBase(attr, formatter, Slider);
}

function VMEditBox(attr: CustomAttrBind<EditBox>)
function VMEditBox(attr: WatchPath, formatter?: Formatter<BaseValueType, unknown>)
function VMEditBox(attr: CustomAttrBind<EditBox> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
    return VMBase(attr, formatter, EditBox);
}

function VMToggle(attr: CustomAttrBind<Toggle>)
function VMToggle(attr: WatchPath)
function VMToggle(attr: WatchPath, formatter: Formatter<boolean, unknown>)
function VMToggle(attr: CustomAttrBind<Toggle> | WatchPath, formatter?: Formatter<boolean, unknown>) {
    return VMBase(attr, formatter, Toggle);
}

function VMUIOpacity(attr: CustomAttrBind<UIOpacity>)
function VMUIOpacity(attr: WatchPath)
function VMUIOpacity(attr: WatchPath, formatter: Formatter<number, unknown>)
function VMUIOpacity(attr: CustomAttrBind<UIOpacity> | WatchPath, formatter?: Formatter<number, unknown>) {
    return VMBase(attr, formatter, UIOpacity);
}

function VMUITransform(attr: CustomAttrBind<UITransform>)
function VMUITransform(attr: WatchPath)
function VMUITransform(attr: WatchPath, formatter: Formatter<Size, unknown>)
function VMUITransform(attr: CustomAttrBind<UITransform> | WatchPath, formatter?: Formatter<Size, unknown>) {
    return VMBase(attr, formatter, UITransform);
}

function VMButton(attr: CustomAttrBind<Button>)
function VMButton(attr: WatchPath)
function VMButton(attr: WatchPath, formatter: Formatter<boolean, unknown>)
function VMButton(attr: CustomAttrBind<Button> | WatchPath, formatter?: Formatter<boolean, unknown>) {
    return VMBase(attr, formatter, Button);
}

function VMSkeleton(attr: SkinAttrBind<sp.Skeleton>)
function VMSkeleton(attr: WatchPath)
function VMSkeleton(attr: WatchPath, formatter: Formatter<sp.SkeletonData, { bundle?: string, loaderKey: string }>)
function VMSkeleton(attr: SkinAttrBind<sp.Skeleton> | WatchPath, formatter?: Formatter<sp.SkeletonData, { bundle?: string, loaderKey: string }>) {
    return VMBase(attr, formatter, sp.Skeleton);
}

function VMSkin(attr: SkinAttrBind<Renderer>)
function VMSkin(attr: WatchPath)
function VMSkin(attr: WatchPath, formatter: Formatter<Asset, { bundle?: string, loaderKey: string }>)
function VMSkin(attr: SkinAttrBind<Renderer> | WatchPath, formatter?: Formatter<Asset, { bundle?: string, loaderKey: string }>) {
    return VMBase(attr, formatter, Renderer);
}

function VMFor(attr: VMForAttr) {
    return _VMBase(eVMFuncType.For, attr);
}

function VMEvent(watchPath: WatchPath, formatter: DataChanged) {
    return _VMBase(eVMFuncType.Event, { watchPath, formatter });
}


declare global {

    interface __IDecorator {
        VMNode: typeof VMNode;
        VMComponent: typeof VMComponent;
        VMLabel: typeof VMLabel;
        VMRichText: typeof VMRichText;
        VMSprite: typeof VMSprite;
        VMProgressBar: typeof VMProgressBar;
        VMSlider: typeof VMSlider;
        VMFor: typeof VMFor;
        VMEvent: typeof VMEvent;

        VMButton: typeof VMButton;
        VMUITransform: typeof VMUITransform;
        VMUIOpacity: typeof VMUIOpacity;
        VMToggle: typeof VMToggle;
        VMEditBox: typeof VMEditBox;
        VMSkeleton: typeof VMSkeleton;
        VMSkin: typeof VMSkin;

        mvvm: typeof mvvm;
    }
}

tnt._decorator.mvvm = mvvm;
tnt._decorator.VMNode = VMNode;
tnt._decorator.VMComponent = VMComponent;
tnt._decorator.VMLabel = VMLabel;
tnt._decorator.VMRichText = VMRichText;
tnt._decorator.VMSprite = VMSprite;
tnt._decorator.VMProgressBar = VMProgressBar;
tnt._decorator.VMSlider = VMSlider;
tnt._decorator.VMFor = VMFor;
tnt._decorator.VMEvent = VMEvent;

tnt._decorator.VMButton = VMButton;
tnt._decorator.VMUITransform = VMUITransform;
tnt._decorator.VMUIOpacity = VMUIOpacity;
tnt._decorator.VMToggle = VMToggle;
tnt._decorator.VMEditBox = VMEditBox;
tnt._decorator.VMSkeleton = VMSkeleton;
tnt._decorator.VMSkin = VMSkin;

export { };