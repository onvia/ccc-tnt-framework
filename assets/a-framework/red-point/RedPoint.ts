
import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

declare global {

    interface ITNT {
        RedPoint: typeof RedPoint;
    }

    namespace tnt {
        type RedPoint<Options = any> = InstanceType<typeof RedPoint<Options>>;

        namespace RedPoint {
            type ShowType = RedPointShowTypeEnum;
        }
    }
}


enum RedPointShowTypeEnum {
    Normal = 1, // 普通红点
    Number = 2, //数值
    Mark = 3, // 感叹号
    Once = 4, // 一次性红点
}

const RedPointLoaderKey = "red-point-loader";

const RedPointEvent = {
    EVENT_NEED_UPDATE: "EVENT_NEED_UPDATE",
    EVENT_UPDATE_DISPLAY: "EVENT_UPDATE_DISPLAY",
    EVENT_CHANGE_SHOW_TYPE: "EVENT_CHANGE_SHOW_TYPE",
    EVENT_ADD_DISPLAY: "EVENT_ADD_DISPLAY",
    EVENT_REMOVE_DISPLAY: "EVENT_REMOVE_DISPLAY",
}



@ccclass('RedPoint')
class RedPoint<Options = any> extends tnt.EventMgr {
    public static readonly loaderKey = RedPointLoaderKey;
    public static readonly Event = RedPointEvent;
    public static readonly ShowType = RedPointShowTypeEnum;

    public get id(): number {
        return this.redPointInfo.id;
    }
    public get name(): string {
        return this.redPointInfo.name;
    }
    private _redPointInfo: RedPointInfo;
    public get redPointInfo(): RedPointInfo {
        return this._redPointInfo;
    }
    public set redPointInfo(value: RedPointInfo) {
        if (!value) {
            return;
        }
        this._redPointInfo = value;
        this.showType = value.showType;
    }
    public options: Options = null;

    private _parent: RedPoint = null;
    public get parent(): RedPoint {
        return this._parent;
    }

    private _showType: RedPointShowTypeEnum = RedPointShowTypeEnum.Normal;
    public get showType(): RedPointShowTypeEnum {
        return this._showType;
    }
    public set showType(value: RedPointShowTypeEnum) {
        if (this._showType != value) {
            this._showType = value;
            this.emit(RedPointEvent.EVENT_CHANGE_SHOW_TYPE, this.id);
        }
    }

    public children: RedPoint[] = [];
    private _count: number = 0;
    public get count(): number {
        return this._count;
    }

    private _isDirty = false;
    public get isDirty() {
        return this._isDirty;
    }
    public set isDirty(value) {
        if (this._isDirty != value) {
            this._isDirty = value;
            if (value && this._parent) {
                this._parent.isDirty = true;
            }
        }
    }
    constructor(redPointInfo: RedPointInfo, options: any) {
        super();
        this.redPointInfo = redPointInfo;
        this.options = options;
    }

    /**
     * 设置显示节点
     *
     * @template T
     * @param {Node} pointRoot
     * @param {(Constructor<T> | string)} clazz
     * @return {*} 
     * @memberof RedPoint
     */
    public setDisplayProxy<T extends tnt.RedPointComp>(pointRoot: Node, clazz: GConstructor<T> | string) {
        if (!pointRoot || !clazz) {
            console.error(`RedPoint-> 红点节点错误`);
            return;
        }
        this.emit(RedPointEvent.EVENT_ADD_DISPLAY, this.id, pointRoot, clazz);
    }
    public removeDisplayNode() {
        this.emit(RedPointEvent.EVENT_REMOVE_DISPLAY, this.id);
    }

    public addChild(child: RedPoint) {
        if (!child) {
            console.error(`RedPoint-> addChild child is null`);
            return;
        }
        child._parent = this;
        this.children.push(child);
    }

    public removeChild(child: RedPoint) {
        this.children.fastRemove(child);
        child._parent = null;
    }

    /**
     * 设置红点值
     *
     * @param {number} count
     * @param {boolean} [batch=false] 是否处于批量更新阶段，如果处于批量更新阶段，则不会更新父节点值，需要在最后手动调用 `calculateCount`
     * @memberof RedPoint
     */
    public setCount(count: number) {
        if (this.isLeaf()) {
            this._updateCount(count);
            // 更新完数据之后 关闭标识
            this.isDirty = false;
        } else {
            console.log(`RedPoint-> 当前红点[${this.id}]不是叶子节点，无法直接设置 红点计数`);
        }
    }

    /**
     * 刷新红点
     *
     * @memberof RedPoint
     */
    public refresh() {
        this.emit(RedPointEvent.EVENT_NEED_UPDATE, this.id);
    }

    private _updateCount(count: number) {
        if (this._count != count) {
            this._count = count;
            this.isDirty = true;
            this._updateDisplayNodeStatus();
        }
    }

    /**
     * 刷新父节点计数
     *
     * @memberof RedPoint
     */
    public _refreshParent() {
        this._onRefreshParent();
    }

    private _onRefreshParent() {
        this.parent?._refreshSelf();
        this.parent?._onRefreshParent();
    }

    private _refreshSelf() {
        if (!this.isDirty) {
            return;
        }
        let count = 0;
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (child.isDirty) {
                child._refreshSelf();
            }
            count += child.count;
        }
        this._updateCount(count);
        // 更新完之后关闭标识
        this.isDirty = false;
    }


    private _updateDisplayNodeStatus() {
        this.emit(RedPointEvent.EVENT_UPDATE_DISPLAY, this.id);
    }

    /**
     * 刷新
     *  
     * @memberof RedPoint
     */
    public _refresh() {
        if (this.isLeaf()) {
            this._refreshParent();
        } else {
            this._refreshSelf();
        }
    }

    public isLeaf() {
        return this.children.length === 0;
    }

    public destroy() {
        this.clear();
    }

    public clear(): void {
        super.clear();
        this.children.forEach((child) => {
            child.destroy();
        });
        this.removeDisplayNode();
        this.parent?.removeChild(this);
        this.children.length = 0;
        this._parent = null;
    }
}

tnt.RedPoint = RedPoint;

export { };