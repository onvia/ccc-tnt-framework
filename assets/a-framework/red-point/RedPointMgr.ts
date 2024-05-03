
import { _decorator, Node, director, Director, isValid } from 'cc';
import { RedPointConfig } from './RedPointConfing';
const { ccclass } = _decorator;


declare global {
    interface ITNT {
        redPointMgr: RedPointMgr;
    }
}

// CHANGELOG: 
// 1. 增加更新标记，在每帧后统一更新，处理一帧内多次调用相同红点更新
// 2. 增加红点更新优先级

@ccclass('RedPointMgr')
class RedPointMgr extends tnt.EventMgr {

    public root: tnt.RedPoint = null;
    protected _redPointMap: Map<number, tnt.RedPoint> = null;
    protected _redPointRequestUpdate: IRedPointRequestUpdate = null;
    protected _redPointDisplayMap: Map<number, Array<tnt.RedPointComp>> = null;

    //存储一帧结束后要更新的红点
    protected _preUpdateRedPointMap: Map<tnt.RedPoint, boolean> = null;

    constructor() {
        super();
        this._redPointMap = new Map();
        this._redPointDisplayMap = new Map();
        this._preUpdateRedPointMap = new Map();
    }

    public initWithData(data: RedPointInfo[], rootId: number) {
        if (this._redPointMap.size > 0) {
            console.warn(`RedPointMgr-> 请不要重复调用红点初始化`);
            return;
        }
        if (!data?.length) {
            console.warn(`RedPointMgr-> 红点初始化失败，数据不存在`);
            return;
        }

        this.clear();

        for (let i = 0; i < data.length; i++) {
            const info = data[i];
            this._createRedPoint(info, null);
        }

        // 设置 根节点，如果没有被创建，则创建一个默认的
        this.root = this._redPointMap.get(rootId) ?? this._createRedPoint({ id: rootId, name: 'main', parent: 0, showType: tnt.RedPoint.ShowType.Normal, priority: 0 }, null);

        // 对每一个节点设置 父节点
        this._redPointMap.forEach((redPoint) => {
            this._setRedPointParent(redPoint);
        });

        // 进行一次全部节点的更新
        if (this._redPointRequestUpdate) {
            this.refreshAllRedPoint();
        }
    }

    /**
     * 获取一个红点
     *
     * @template Options
     * @param {RedPointInfo} redPointInfoOrId
     * @param {Options} options 增加一个选项，在更新的时候会传给更新函数
     * @return {*} 
     * @memberof RedPointMgr
     */
    public getRedPoint<Options>(redPointInfoOrId: RedPointInfo | number, options?: Options) {
        let id: number = -1;
        let redPointInfo: RedPointInfo = null;
        if (typeof redPointInfoOrId === 'number') {
            id = redPointInfoOrId
        } else {
            redPointInfo = redPointInfoOrId;
            id = redPointInfoOrId.id;
        }
        if (this._redPointMap.has(id)) {
            let point = this._redPointMap.get(id);
            redPointInfo && (point.redPointInfo = redPointInfo);
            options && (point.options = options);
            if (!point.parent) {
                this._setRedPointParent(point);
            }
            return point;
        }
        let redPoint = this._createRedPoint(redPointInfo, options);
        this._setRedPointParent(redPoint);
        return redPoint;
    }

    /**
     * 创建红点
     *
     * @template Options
     * @param {RedPointInfo} redPointInfo
     * @param {Options} options 增加一个选项，在更新的时候会传给更新函数
     * @return {*} 
     * @memberof RedPointMgr
     */
    private _createRedPoint<Options>(redPointInfo: RedPointInfo, options: Options) {
        if (!redPointInfo) {
            return null;
        }
        let point = new tnt.RedPoint(redPointInfo, options);
        this._redPointMap.set(redPointInfo.id, point);

        // 监听指定 id 的红点
        point.on(tnt.RedPoint.Event.EVENT_NEED_UPDATE, this._onNeedUpdate, this);
        point.on(tnt.RedPoint.Event.EVENT_CHANGE_SHOW_TYPE, this._onChangeShowType, this);
        point.on(tnt.RedPoint.Event.EVENT_ADD_DISPLAY, this._onAddDisplay, this);
        point.on(tnt.RedPoint.Event.EVENT_UPDATE_DISPLAY, this._onUpdateDisplay, this);
        point.on(tnt.RedPoint.Event.EVENT_REMOVE_DISPLAY, this._onRemoveDisplay, this);

        return point;
    }

    /**
     * 红点设置父节点
     *
     * @private
     * @param {RedPoint} redPoint
     * @memberof RedPointMgr
     */
    private _setRedPointParent(redPoint: tnt.RedPoint) {
        let parent = this._redPointMap.get(redPoint.redPointInfo.parent);
        if (!parent) {
            if (redPoint.id !== this.root.id) {
                console.error(`RedPointMgr-> ${redPoint.id} 没有父节点`);
            }
            return;
        }
        if (redPoint.id === parent.id) {
            console.warn(`RedPointMgr-> ${redPoint.id} 无法设置自己为自己的父节点`);
            return;
        }
        parent.addChild(redPoint);
    }

    /**
     * 销毁指定红点
     *
     * @param {number} id
     * @memberof RedPointMgr
     */
    public destroyRedPoint(id: number) {
        if (this._redPointMap.has(id)) {
            let redPoint = this._redPointMap.get(id);
            redPoint.destroy();
            this._redPointMap.delete(id);
        }
        this.removeDisplay(id);
    }

    /**
     * 给指定红点设置显示节点
     *
     * @template T
     * @param {number} id
     * @param {Node} pointRoot
     * @param {(Constructor<T> | string)} clazz
     * @memberof RedPointMgr
     */
    public async setDisplayProxy<T extends tnt.RedPointComp>(id: number, pointRoot: Node, clazz: GConstructor<T> | string) {

        if (!pointRoot || !clazz) {
            console.error(`RedPointMgr-> 红点宿主节点错误`);
            return;
        }
        let displayArray = this._redPointDisplayMap.get(id);

        if (!displayArray) {
            displayArray = new Array();
            this._redPointDisplayMap.set(id, displayArray);
        }

        let redPoint = this._redPointMap.get(id);
        if (!redPoint) {
            console.error(`RedPointMgr-> 没有指定红点数据 ${id}`);
            return;
        }



        let display = await tnt.resourcesMgr.addPrefabNode(tnt.RedPoint.loaderKey, clazz, pointRoot);
        if (isValid(display, true)) {
            if (pointRoot && isValid(pointRoot, true)) {
                displayArray.push(display);
                display.updateShowType(redPoint.showType);
                this._updateDisplay(id, redPoint, display);
            } else {
                display.node.destroy();
                display.destroy();
            }
        }
    }


    /**
     * 设置请求更新接口
     *
     * @param {IRedPointRequestUpdate} redPointRequestUpdate
     * @memberof RedPointMgr
     */
    public setRedPointRequestUpdate(redPointRequestUpdate: IRedPointRequestUpdate) {
        this._redPointRequestUpdate = redPointRequestUpdate;
        if (redPointRequestUpdate && this._redPointMap.size > 0) {
            this.refreshAllRedPoint();
        }
    }

    /**
     * 直接设置指定红点的计数
     *
     * @param {number} id
     * @param {number} count
     * @return {*} 
     * @memberof RedPointMgr
     */
    public setCount(id: number, count: number) {
        let redPoint = this._redPointMap.get(id);
        if (!redPoint) {
            console.warn(`RedPointMgr-> setCount 没有找到指定红点: ${id}`);
            return;
        }
        redPoint.setCount(count);
    }

    // 执行更新红点
    private _updateRedPoint() {
        this._preUpdateRedPointMap.forEach((fullTree, redPoint) => {
            this._refreshRedPoint(redPoint, fullTree);
            redPoint._refreshParent();
        });
        this._preUpdateRedPointMap.clear();

    }

    // 添加预更新的红点
    private _addPreUpdateRedPoint(redPoint: tnt.RedPoint, fullTree = false) {
        if (this._preUpdateRedPointMap.has(redPoint)) {
            let param = this._preUpdateRedPointMap.get(redPoint);
            if (param != fullTree) {
                this._preUpdateRedPointMap.set(redPoint, param || fullTree);
            }
            return;
        }

        if (this._preUpdateRedPointMap.size == 0) {
            // 添加执行一次的 AFTER_UPDATE 事件监听
            director.once(Director.EVENT_AFTER_UPDATE, this._updateRedPoint, this);
        }
        this._preUpdateRedPointMap.set(redPoint, fullTree);
    }

    /**
     * 更新所有红点，性能消耗较大
     *
     * @return {*} 
     * @memberof RedPointMgr
     */
    public refreshAllRedPoint() {
        if (!this._redPointRequestUpdate) {
            console.warn(`RedPointMgr-> 没有设置红点更新方法`);
            return;
        }

        // 直接更新
        // this._refreshRedPoint(this.root, true);

        // 修改为 update 后更新
        this._addPreUpdateRedPoint(this.root, true);
    }

    /**
     * 主动更新某个红点
     *
     * @param {number} id  红点 id
     * @param {boolean} [fullTree = false]  是否更新当前红点下所有子节点
     * @return {*} 
     * @memberof RedPointMgr
     */
    public refreshRedPoint(id: number, fullTree: boolean = false) {
        if (!this._redPointRequestUpdate) {
            console.warn(`RedPointMgr-> 没有设置红点更新方法，无法更新红点 [${id}]`);
            return;
        }
        let redPoint = this._redPointMap.get(id);
        if (!redPoint) {
            console.warn(`RedPointMgr-> 没有找到指定红点: ${id}`);
            return;
        }
        // 根节点 和 数字显示的红点 必须检测所有子节点
        if (redPoint.showType === tnt.RedPoint.ShowType.Number || id === this.root.id) {
            fullTree = true;
        }

        // 直接更新
        // this._refreshRedPoint(redPoint, fullTree);
        // redPoint._refreshParent();

        // 修改为 update 后更新
        this._addPreUpdateRedPoint(redPoint, fullTree);
    }

    /**
     * 更新红点，递归
     *
     * @private
     * @param {RedPoint} redPoint
     * @param {boolean} [fullTree=false]
     * @return {*}  {boolean}
     * @memberof RedPointMgr
     */
    private _refreshRedPoint(redPoint: tnt.RedPoint, fullTree: boolean = false): boolean {
        if (!redPoint) {
            return false;
        }
        let refresh = false;
        if (redPoint.isLeaf) {
            let count = this._redPointRequestUpdate.requestUpdate(redPoint.redPointInfo.parent, redPoint.id, redPoint.options);
            if (count >= 0) {
                redPoint.setCount(count);
            }
            refresh = count > 0;
        } else {
            for (let i = 0; i < redPoint.children.length; i++) {
                const child = redPoint.children[i];
                let check = this._refreshRedPoint(child, fullTree);
                // 在不是检查整棵树的情况下，只要检查到有红点就停止检测
                if (check) {
                    refresh = true;
                    if (!fullTree) {
                        break;
                    }
                }
            }

            redPoint._refresh();
        }
        return refresh;
    }

    private _onNeedUpdate(id: number) {
        this.refreshRedPoint(id);
    }

    private _onAddDisplay<T extends tnt.RedPointComp>(id: number, pointRoot: Node, clazz: GConstructor<T> | string) {
        this.setDisplayProxy(id, pointRoot, clazz);
    }
    private _onRemoveDisplay(id: number) {
        this.removeDisplay(id);
    }
    private _onUpdateDisplay(id: number) {
        let redPoint = this._redPointMap.get(id);
        if (!redPoint) {
            this.removeDisplay(id);
            return;
        }
        let displayArray = this._redPointDisplayMap.get(id);
        if (displayArray) {
            // 倒序
            for (let i = displayArray.length - 1; i >= 0; i--) {
                let display = displayArray[i];
                this._updateDisplay(id, redPoint, display);
            }
        }
    }
    private _onChangeShowType(id: number) {
        let displayArray = this._redPointDisplayMap.get(id);
        for (const display of displayArray) {
            if (display && isValid(display, true)) {
                let redPoint = this._redPointMap.get(id);
                redPoint && display.updateShowType(redPoint.showType);
            }
        }
    }

    private _updateDisplay(id: number, redPoint: tnt.RedPoint, display: tnt.RedPointComp) {
        if (isValid(display, true) && isValid(display.node, true)) {
            display.updateCount(redPoint.count);
            display.updateDisplay(redPoint.enabled && redPoint.isDisplay); // 红点启用并且数量大于0

        } else {
            this._removeDisplay(id, display);
        }
    }

    private _removeDisplay(id: number, display: tnt.RedPointComp, checkEmpty = true) {
        if (display) {
            if (isValid(display, true) && isValid(display.node, true)) {
                display.node.removeFromParent();
                display.node.destroy();
                display.destroy();
            }

            if (checkEmpty) {
                let displayArray = this._redPointDisplayMap.get(id);
                displayArray.removeOne(display);
                if (!displayArray.length) {
                    this._redPointDisplayMap.delete(id);
                }
            }
        }
    }
    public removeDisplay(id: number) {
        let displayArray = this._redPointDisplayMap.get(id);
        for (const display of displayArray) {
            this._removeDisplay(id, display, false);
        }
        displayArray.length = 0;
        this._redPointDisplayMap.delete(id);
    }

    /**
     *
     *
     * @memberof RedPointMgr
     */
    setParentTypeUseChildTypeWhenHasSort(b: boolean) {
        RedPointConfig.parentTypeUseHighestChildTypeWhenHasSort = b;
    }

    public destroy() {
        this.clear();
    }

    public clear(): void {
        super.clear();
        this._redPointMap.clear();
        this.root?.destroy();
        tnt.loaderMgr.releaseLoader(tnt.RedPoint.loaderKey);
    }

    private static _instance: RedPointMgr = null
    public static getInstance(): RedPointMgr {
        if (!this._instance) {
            this._instance = new RedPointMgr();
        }
        return this._instance;
    }
}

tnt.redPointMgr = RedPointMgr.getInstance();

export { };