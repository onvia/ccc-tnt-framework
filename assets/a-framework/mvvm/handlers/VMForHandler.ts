
import { Component, isValid, Node } from "cc";
import { DEV } from "cc/env";
import { ForOpType, VMForAttr, WatchPath } from "../_mv_declare";
import { VMBaseImplHandler } from "./VMBaseImplHandler";
import { VMCustomHandler } from "./VMCustomHandler";
declare global {
    interface IVMItem {
        updateItem(data: any, index: number, ...args);
    }
}

export class VMForHandler extends VMBaseImplHandler {

    public declare attr: VMForAttr;

    pool: tnt.Pool<Promise<tnt.UIBase>> = new tnt.Pool({
        maxCount: 32,
        newObject: () => {
            return tnt.uiMgr.loadUIWithCtor(this.userControllerComponent, this.attr.component);
        },
    });

    promises: Promise<tnt.UIBase>[] = [];

    onInitValue(): void {
        super.onInitValue();
    }

    onBind(): void {
        super.onBind();
    }

    onUnBind(): void {
        super.onUnBind();
        let forEachFn = (obj) => {
            obj.then((item) => {
                if (isValid(item)) {
                    item.node.destroy();
                    item.destroy();
                }
            })
        }

        this.pool.all().forEach(forEachFn);
        Promise.all(this.pool.all()).then(() => {
            this.pool.clear();
        });

        this.promises.forEach(forEachFn);
        Promise.all(this.pool.all()).then(() => {
            this.promises.length = 0;
        });
    }

    protected async _updateValue(newValue: any, oldValue: any, watchPath: WatchPath) {
        let action: ForOpType = "" as any;
        if (this.promises.length < newValue.length) {
            let count = newValue.length - this.promises.length;
            for (let i = 0; i < count; i++) {
                let promise: Promise<tnt.UIBase> = this.pool.get();
                this.promises.push(promise);
                promise.then((ui) => {
                    ui.node.parent = this.node;
                });
            }

            if (!!!oldValue) {
                action = 'init';
            } else {
                action = 'add';
            }
        } else if (this.promises.length > newValue.length) {
            // 删除元素
            while (this.promises.length > newValue.length) {
                let promise = this.promises.pop();
                promise.then((ui) => {
                    ui.node.removeFromParent();
                });
                this.pool.put(promise);
            }
            action = 'delete';
        } else {
            action = 'refresh';
        }

        // 更新 Item
        for (let i = 0; i < this.promises.length; i++) {
            const promise = this.promises[i];
            promise.then((ui) => {
                let index = i;
                let item = ui as any as IVMItem;
                item.updateItem(newValue[index], index);
            });
        }

        Promise.all(this.promises).then(() => {
            // 刷新完成
            this.attr.onChange(action);
        });
    }

    onV2MBind(): void {

    }
}