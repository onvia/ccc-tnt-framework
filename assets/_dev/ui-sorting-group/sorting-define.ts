import { UITransform } from "cc";
import { JSB } from "cc/env";
declare module 'cc' {
    interface UIRenderer {
        /**
         * 渲染优先级
         */
        renderPriority:number;

        /**
         * 渲染透明度
         */
        renderOpacity:number;
    }
    interface UITransform {
        /**
         * 排序优先级 - private
         */
        _sortingPriority:number;

        /**
         * 排序优先级
         */
        sortingPriority:number;

        /**
         * 排序优使能 - private
         */
        _sortingEnabled:boolean;

        /**
         * 排序优使能
         */
        sortingEnabled:boolean;
    }
}

if(!('sortingPriority' in UITransform.prototype)){
    Object.defineProperty(UITransform.prototype, 'sortingPriority', {
        get: function() { 
            return this._sortingPriority; 
        },
        set: function(value) { 
            this._sortingPriority = value;
            if(JSB){
                this.node.uiSortingPriority = value;
            }
        },
        enumerable: true
    });

    Object.defineProperty(UITransform.prototype, 'sortingEnabled', {
        get: function() { 
            return this._sortingEnabled; 
        },
        set: function(value) { 
            this._sortingEnabled = value;
            if(JSB){
                this.node.uiSortingEnabled = value;
            }
        },
        enumerable: true
    });
}

/**
 * 排序层级
 */
export enum SortingLayer {
    
    /** 
     * 默认层级，不能删除和修改此枚举值
     */
    DEFAULT = 0,
    
    // 测试定义，可以直接移除
    TEST_LIST_ITEM = 1,
}

/**
 * 在层级中最大排序值
 */
export const ORDER_IN_LAYER_MAX = 1000;
export const ORDER_MAX = 1000;
