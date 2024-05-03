
import { _decorator, Component, Node, ccenum, CCInteger, CCFloat, Enum, director, UI, UIRenderer, UITransform } from 'cc';
import { EDITOR } from 'cc/env';
import { ORDER_IN_LAYER_MAX, ORDER_MAX, SortingLayer } from './sorting-define';
const { ccclass, property, type, disallowMultiple, requireComponent, executeInEditMode } = _decorator;

@ccclass('性能优化/SortingGroup')
@requireComponent(UITransform)
@disallowMultiple(true)
@executeInEditMode(true)
export class SortingGroup extends Component {
    /**
     * 排序层
     */
    @type(Enum(SortingLayer))
    private _sortingLayer: SortingLayer = SortingLayer.DEFAULT;

    /**
     * 排序层
     */
    @type(Enum(SortingLayer))
    get sortingLayer() {
        return this._sortingLayer;
    }
    set sortingLayer(value: SortingLayer) {
        if (EDITOR) {
            this._setSortingLayer(value);
            Editor.Dialog.warn("连同修改子节点的 SortingLayer", {
                buttons: ["确定", "取消"],
                cancel: 1,
            }).then((res) => {
                if (res.response == 0) {                    
                    this._setChildSortingLayerRecursive(this.node, value);
                }
            }).catch((e) => {
                console.log(`sorting-group-> err `, e);
            });
            return;
        }
        this._setSortingLayer(value);
        console.log(`sorting-group-> `, this.uiTransform.sortingPriority);
    }

    /**
     * 排序值
     */
    @property({ type: CCFloat, min: 0, max: ORDER_IN_LAYER_MAX })
    private _orderInLayer: number = 0;

    /**
     * 排序值
     */
    @property({ type: CCFloat, min: 0, max: ORDER_IN_LAYER_MAX })
    get orderInLayer() {
        return this._orderInLayer;
    }
    set orderInLayer(value: number) {
        this._orderInLayer = value;
        this.uiTransform.sortingPriority = this.calcPriority();
        console.log(`sorting-group-> `, this.uiTransform.sortingPriority);
    }


    /**
     * UITransform
     */
    private _uiTransform: UITransform = null;

    /**
     * UITransform
     */
    get uiTransform() {
        if (this._uiTransform == null) {
            this._uiTransform = this.getComponent(UITransform);
        }
        return this._uiTransform;
    }

    onEnable() {
        this.uiTransform.sortingPriority = this.calcPriority();
        this.uiTransform.sortingEnabled = true;
    }

    onDisable() {
        this.uiTransform.sortingPriority = 0;
        this.uiTransform.sortingEnabled = false;
    }

    private calcPriority() {
        let _sign = Math.sign(this._sortingLayer);
        _sign = _sign == 0 ? 1 : _sign;
        return _sign * (Math.abs(this._sortingLayer) * ORDER_IN_LAYER_MAX + this._orderInLayer) * ORDER_MAX;
    }


    private _setChildSortingLayerRecursive(node: Node, _sortingLayer: SortingLayer) {
        node = node || this.node;
        if (!node) {
            return;
        }
        for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            let childSortingGroup = child.getComponent(SortingGroup);
            if (childSortingGroup) {
                childSortingGroup._setSortingLayer(_sortingLayer);
            }
            this._setChildSortingLayerRecursive(child, _sortingLayer);
        }
    }
    private _setSortingLayer(_sortingLayer: SortingLayer) {
        this._sortingLayer = _sortingLayer;
        this.uiTransform.sortingPriority = this.calcPriority();
        console.log(`sorting-group-> ${this.node.name}, layer ${_sortingLayer}`);
    }
}
