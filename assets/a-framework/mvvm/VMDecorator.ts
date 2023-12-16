
import { Node, CCObject, Component, js, instantiate, __private, Button, Label, ProgressBar, Sprite, Slider, UIRenderer, UITransform, UIOpacity, SpriteFrame, RichText } from "cc";
import { BaseValueType, CustomAttrBind, DataChanged, Formatter, LabelAttrBind, ReturnValueType, SpriteAttrBind, VMForAttr, WatchPath } from "./_mv_declare";

type DecoratorCompData = { attr: CustomAttrBind<any> | WatchPath, formatter: Formatter<ReturnValueType, unknown>, ctor: GConstructor<any> };
type DecoratorForData = VMForAttr;
type DecoratorEventData = { watchPath: WatchPath, formatter: DataChanged };

enum VMFuncType {
    Comp, For, Event
}

type FuncDataMap = {
    [VMFuncType.Comp]: DecoratorCompData;
    [VMFuncType.For]: DecoratorForData;
    [VMFuncType.Event]: DecoratorEventData;
};

type DecoratorData<T extends VMFuncType> = { propertyKey: string, funcType: T, data: FuncDataMap[T] };


/**
 * mvvm 装饰器
 * @param _tagOrDelay //唯一 标签  | 延迟注册
 * @param _delay // 延迟注册
 */
// 特殊要求： 必须在 @ccclass 之后调用 例如
// @ccclass
// @mvvm()
// class UIView { }
function mvvm(_tagOrDelay?: string | number, _delay?: number) {
    return <T extends { new(...args: any[]): Component }>(constructor: T) => {
        // 修复 使用类装饰器之后 导致 node.getComponent(组件基类) 返回值 为空的情况
        var base = js.getSuper(constructor);
        base === CCObject && (base = null);
        if (base) {
            base._sealed = false;
        }

        return class extends constructor {

            declare _vmDecoratorDataArray: DecoratorData<VMFuncType>[];

            public _vmTag: string = null;
            public _initVMTag() {
                if (!this._vmTag) {
                    if (_tagOrDelay && typeof _tagOrDelay === 'number') {
                        _delay = _tagOrDelay;
                        _tagOrDelay = undefined;
                    }
                    this._vmTag = _tagOrDelay as string || ((this.name || "VM-AUTO-TAG") + '<' + this.node.uuid.replace('.', '') + '>');
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
                !this._vmDecoratorDataArray && (this._vmDecoratorDataArray = []);
                if (!this._vmDecoratorDataArray.length) {
                    return;
                }
                for (let i = 0; i < this._vmDecoratorDataArray.length; i++) {
                    const decoratorData = this._vmDecoratorDataArray[i];
                    if (!this[decoratorData.propertyKey]) {
                        console.log(`VMDecorator-> 绑定对象不存在 ${decoratorData.propertyKey}`);
                        // @ts-ignore
                        this.bindNode?.(decoratorData.propertyKey, decoratorData.propertyKey, decoratorData?.data?.ctor);
                    }
                    switch (decoratorData.funcType) {
                        case VMFuncType.Comp:
                            let compData = decoratorData.data as DecoratorCompData;

                            tnt.vm.bind(this, this[decoratorData.propertyKey], compData.attr, compData.formatter);
                            break;
                        case VMFuncType.For:
                            tnt.vm.for(this, this[decoratorData.propertyKey], decoratorData.data as DecoratorForData);
                            break;
                        case VMFuncType.Event:
                            let eventData = decoratorData.data as DecoratorEventData;
                            tnt.vm.event(this, eventData.watchPath, eventData.formatter);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
}

function _VMBase(funcType: VMFuncType, data: FuncDataMap[VMFuncType]) {
    return function (target: any, propertyKey: string) {
        !target._vmDecoratorDataArray && (target._vmDecoratorDataArray = []);
        let _vmDecoratorDataArray: DecoratorData<VMFuncType>[] = target._vmDecoratorDataArray;
        _vmDecoratorDataArray.push({ propertyKey, funcType: funcType, data: data });
    }
}
// function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: A)
// function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: WatchPath)
// function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: WatchPath, formatter: Formatter<ReturnValueType, unknown>)
function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: A | WatchPath, formatter: Formatter<ReturnValueType, unknown>, ctor: GConstructor<T>)
function VMBase<T extends Component | Node, A extends CustomAttrBind<T>>(attr: A | WatchPath, formatter?: Formatter<ReturnValueType, unknown>, ctor?: GConstructor<T>) {

    return _VMBase(VMFuncType.Comp, { attr, formatter, ctor });
}

function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: CustomAttrBind<T>)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: WatchPath)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: WatchPath, formatter: Formatter<ReturnValueType, unknown>)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: CustomAttrBind<T> | WatchPath, formatter: Formatter<ReturnValueType, unknown>)
function VMComponent<T extends Component | Node,>(ctor: GConstructor<T>, attr: CustomAttrBind<T> | WatchPath, formatter?: Formatter<ReturnValueType, unknown>) {
    return VMBase(attr, formatter, ctor);
}

function VMLabel(attr: LabelAttrBind<Label>)
function VMLabel(attr: WatchPath, formatter?: Formatter<BaseValueType, unknown>)
function VMLabel(attr: LabelAttrBind<Label> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
    return VMBase(attr, formatter, Label);
}

function VMRichText(attr: LabelAttrBind<RichText>)
function VMRichText(attr: WatchPath, formatter?: Formatter<BaseValueType, unknown>)
function VMRichText(attr: LabelAttrBind<RichText> | WatchPath, formatter?: Formatter<BaseValueType, unknown>) {
    return VMBase(attr, formatter, RichText);

}


function VMNode(attr: CustomAttrBind<Node>)
function VMNode(attr: WatchPath, formatter?: Formatter<boolean, unknown>)
function VMNode(attr: CustomAttrBind<Node> | WatchPath, formatter?: Formatter<boolean, unknown>) {
    return VMBase(attr, formatter, null);

}


function VMSprite(attr: SpriteAttrBind<Sprite>)
function VMSprite(attr: WatchPath, formatter?: Formatter<SpriteFrame, { bundle?: string, loaderKey: string }>)
function VMSprite(attr: SpriteAttrBind<Sprite> | WatchPath, formatter?: Formatter<SpriteFrame, { bundle?: string, loaderKey: string }>) {
    return VMBase(attr, formatter, Sprite);
}

function VMProgressBar(attr: CustomAttrBind<ProgressBar> | WatchPath, formatter?: Formatter<number, unknown>) {
    return VMBase(attr, formatter, ProgressBar);
}

function VMSlider(attr: CustomAttrBind<Slider> | WatchPath, formatter?: Formatter<number, unknown>) {
    return VMBase(attr, formatter, Slider);
}

function VMFor(attr: VMForAttr) {
    return _VMBase(VMFuncType.For, attr);
}

function VMEvent(watchPath: WatchPath, formatter: DataChanged) {
    return _VMBase(VMFuncType.Event, { watchPath, formatter });
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
        mvvm: typeof mvvm;
    }
    interface ITNT {
        _decorator: __IDecorator;
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


export { };