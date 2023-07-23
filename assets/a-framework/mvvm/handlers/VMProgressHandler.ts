import { Component, Node } from "cc";
import { DEV } from "cc/env";
import { isArray } from "../VMGeneral";
import { WatchPath } from "../_mv_declare";
import { VMCustomHandler } from "./VMCustomHandler";

export class VMProgressHandler extends VMCustomHandler {


    onInitValue(): void {
        if (this._isProgress && !this.attr.formatter && isArray(this.attr.watchPath) && this.attr.watchPath.length > 2) {
            let msg = `VMProgressHandler-> [${this.node.name}] 输入参数 (watchPath) 数量过多，请实现 formator 方法`;
            if (DEV) {
                throw new Error(msg);
            } else {
                console.error(msg);
            }
        }
        super.onInitValue();
    }

    onBind(): void {
        super.onBind();
    }

    onUnBind(): void {
        super.onUnBind();
    }

    protected async formatValue(newValue: any, oldValue: any, node: Node, nodeIdx: number, watchPath: WatchPath) {
        if (this.attr.formatter) {
            return await super.formatValue(newValue, oldValue, node, nodeIdx, watchPath);
        }
        if (this._isProgress) {
            let value = null;
            let _newValue = newValue;
            let _oldValue = oldValue;
            if (Array.isArray(watchPath)) {
                _newValue = newValue[0] / newValue[1];
                if (oldValue === null || oldValue === undefined) {
                    _oldValue = 0;
                } else {
                    _oldValue = oldValue[0] / oldValue[1];
                }
            }
            value = _newValue;
            if (value > 1) value = 1;
            if (value < 0 || Number.isNaN(value)) {
                value = 0;
            }
            return value;
        }
        return newValue;
    }

    private get _isProgress() {
        return this.attr._targetPropertyKey === 'progress'
    }
}