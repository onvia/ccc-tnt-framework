import { Component, Node } from "cc";
import { isArray } from "../VMGeneral";
import { TriggerOpTypes } from "../VMOperations";
import { VMBaseAttr, WatchPath } from "../_mv_declare";

export abstract class VMTrigger<T extends object = any>{

    // 用户组件
    declare userControllerComponent: any;
    public declare target: T;
    public declare attr: VMBaseAttr<any>;
    public declare isValid: boolean;
    private declare _node: Node;
    protected declare templateValuesCache: string[] | number[] | boolean[];

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
        this.attr.tween?.onLoad();
        this.templateValuesCache = [];

        if (this.node) {
            if (this.target instanceof Component) {
                this.node.on(Node.EventType.COMPONENT_REMOVED, (comp) => comp === this.target && this.unbind(), this);
            }
            this.node.on(Node.EventType.NODE_DESTROYED, () => this.unbind(), this);
        }
        this.onInitValue();
        this.onBind();
    }
    public unbind() {
        if (!this.isValid) {
            return;
        }
        this.isValid = false;
        this.onUnBind();

        this.attr.tween?.onDestroy();
        if (this.node) {
            this.node.targetOff(this);
        }

        this.templateValuesCache.length = 0;
    }

    protected async formatValue(newValue: any, oldValue: any, node: Node, nodeIdx: number, watchPath: WatchPath) {
        if (this.attr.formator) {
            return await this.attr.formator.call(this.userControllerComponent, {
                trigger: this,
                newValue,
                oldValue,
                node,
                nodeIdx,
                watchPath
            });
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
    protected _updateValueToView(target: T, value: any) {
        let key = this.attr._targetPropertyKey;
        if (key in target) {
            target[key] = value;
        }
    }

    /**
     * 使用格式化处理器进行更新数据
     * @protected
     * @param {*} newValue
     * @param {*} oldValue
     * @param {WatchPath} watchPath
     * @memberof VMTrigger
     */
    protected async _updateValueUseFormator(newValue: any, oldValue: any, watchPath: WatchPath) {
        let val = await this.formatValue(newValue, oldValue, this.node, 0, watchPath);
        this._updateValueToView(this.target, val);
    }

    abstract onInitValue();

    abstract onBind();

    abstract onUnBind();

    abstract trigger(newValue: any, oldValue: any, type: TriggerOpTypes, watchPath: string);

    
    isWatchPath(path: string){
        if(isArray(this.attr.watchPath)){
            return this.attr.watchPath.includes(path);
        }
        return this.attr.watchPath == path;
    }
}