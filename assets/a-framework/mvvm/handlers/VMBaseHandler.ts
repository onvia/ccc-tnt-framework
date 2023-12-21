import { Asset, Component, js, Node, path } from "cc";
import { DEV } from "cc/env";
import { TriggerOpTypes } from "../reactivity/_internals";
import { isArray } from "../VMGeneral";
import { GVMTween } from "../VMTween";
import { FormatterOpts, VMBaseAttr, WatchPath } from "../_mv_declare";

export abstract class VMBaseHandler<T extends object = any>{

    // 用户组件
    declare userControllerComponent: any;
    public declare target: T;
    public declare attr: VMBaseAttr<any>;
    public declare isValid: boolean;
    private declare _node: Node;
    protected declare templateValuesCache: string[] | number[] | boolean[];
    private _tween: IVMTween = null;
    protected _realFinalValue = null; // 一般作为资源路径使用
    protected get tween() {
        if (this._tween) {
            return this._tween;
        }

        if (typeof this.attr.tween == 'boolean') {
            if (this.attr.tween) {
                this._tween = new GVMTween();
            }
        } else if (typeof this.attr.tween == 'number') {
            this._tween = new GVMTween(this.attr.tween);
        } else {
            this._tween = this.attr.tween;
        }
        return this._tween;
    }


    public get node(): Node {
        if (this._node) {
            return this._node;
        }
        if (this.target instanceof Component) {
            this._node = this.target.node;
        } else if (this.target instanceof Node) {
            this._node = this.target;
        }
        return this._node;
    }

    public constructor(target: T, attr: VMBaseAttr<any>) {
        this.target = target;
        this.attr = attr;
    }

    public bind() {
        if (this.isValid) {
            return;
        }
        this.isValid = true;

        this.tween?.onLoad();
        this.templateValuesCache = [];

        if (this.node) {
            if (this.target instanceof Component) {
                this.node.on(Node.EventType.COMPONENT_REMOVED, (comp) => comp === this.target && this.unbind(), this);
            }
            this.node.on(Node.EventType.NODE_DESTROYED, () => this.unbind(), this);
        }
        this.onInitValue();
        this.onBind();

        this.onV2MBind();

        DEV && this._onCheckForDev();
    }
    public unbind() {
        if (!this.isValid) {
            return;
        }
        this.isValid = false;
        this.onUnBind();

        this.tween?.onDestroy();
        if (this.node) {
            this.node.targetOff(this);
        }

        this.templateValuesCache.length = 0;
    }

    protected _onCheckForDev() {

    }

    protected async formatValue(newValue: any, oldValue: any, node: Node, nodeIdx: number, watchPath: WatchPath) {
        if (this.attr.formatter) {
            let options: FormatterOpts = {
                handler: this,
                newValue,
                oldValue,
                node,
                // nodeIdx,
                watchPath,
                attr: this.attr,
                component: this.userControllerComponent
            };
            return await this.attr.formatter.call(this.userControllerComponent, options);
        }
        return newValue;
    }

    /**
     * 更新视图
     *
     * @protected
     * @param {(Node | Component)} target
     * @param {*} value
     * @memberof VMTrigger
     */
    protected _updateTargetValue(target: T, value: any) {
        if (!this.isValid) {
            return false;
        }
        if (this._vmProperty in target) {
            target[this._vmProperty] = value;
            return true;
        }

        let key = this.attr._targetPropertyKey;
        if (key in target) {
            target[key] = value;
            return true;
        }

        return false;
    }

    /**
     * 一般是使用格式化处理器进行更新数据
     * @protected
     * @param {*} newValue
     * @param {*} oldValue
     * @param {WatchPath} watchPath
     * @memberof VMTrigger
     */
    protected async _updateValue(newValue: any, oldValue: any, watchPath: WatchPath) {
        this._realFinalValue = newValue;
        let val = await this.formatValue(newValue, oldValue, this.node, 0, watchPath);
        // 如果是资源，这里判断是否是自己所需要的，防止出现由于加载延迟导致的显示错误问题
        if (val && val instanceof Asset) {
            if (path.basename(this._realFinalValue) !== val.name) {
                return;
            }
        }
        let isSuccess = this._updateTargetValue(this.target, val);

        if (isSuccess && this.attr.onValueChange) {
            let options: FormatterOpts = {
                newValue,
                oldValue,
                watchPath,
                node: this.node,
                handler: this,
                attr: this.attr,
                component: this.userControllerComponent
            }
            this.attr.onValueChange.call(this.userControllerComponent, options);
        }
    }

    protected abstract onInitValue();

    protected abstract onBind();

    protected abstract onUnBind();

    public abstract handle(newValue: any, oldValue: any, type: TriggerOpTypes, watchPath: string);


    public isWatchPath(path: string | string[]) {
        if (isArray(this.attr.watchPath)) {
            if (isArray(path)) {
                let has = path.some((value) => {
                    return this.attr.watchPath.includes(value);
                });
                return has;
            } else {
                return this.attr.watchPath.includes(path);
            }
        }
        return this.attr.watchPath == path;
    }

    protected get _vmProperty() {
        return `_vm$${this.attr._targetPropertyKey}`;
    }

    protected onV2MBind() {
        if (this.attr.isBidirectional) {
            this.V2MBind(this.target as Component | Node);
        }
    }

    protected V2MBind(target: Node | Component) {
        let _property = this.attr._targetPropertyKey;
        if (typeof target[_property] == 'object') {
            console.warn(`VMBaseHandler-> 组件属性为对象类型，无法进行双向绑定`);
            return;
        }
        let descriptor = js.getPropertyDescriptor(target, this.attr._targetPropertyKey);
        target[this._vmProperty] = target[_property];

        Object.defineProperty(target, this._vmProperty, {
            get: descriptor.get,
            set: descriptor.set
        });

        if (Array.isArray(this.attr.watchPath)) {
            console.error(`VMBaseHandler-> 多路径不进行 视图到数据 的绑定`);
            return;
        }

        if (!!descriptor.set) {
            Object.defineProperty(target, _property, {
                get: descriptor.get,
                set: (value) => {
                    descriptor.set.call(target, value);
                    tnt.vm.setValue(this.attr.watchPath as string, value);
                }
            });
            return;
        }
    }
}