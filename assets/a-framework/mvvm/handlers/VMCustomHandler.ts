import { Component, js, Node } from "cc";
import { DEV } from "cc/env";
import { TriggerOpTypes } from "../reactivity/_internals";
import { VMCustomAttr, WatchPath } from "../_mv_declare";
import { VMBaseImplHandler } from "./VMBaseImplHandler";

export class VMCustomHandler<T extends object = any> extends VMBaseImplHandler {

    public declare attr: VMCustomAttr<T>;

    protected onInitValue() {
        super.onInitValue();
    }

    protected onBind(): void {
        super.onBind();
    }

    protected onUnBind(): void {
        super.onUnBind();
    }


    protected onV2MBind() {
        super.onV2MBind();
    }

    public handle(newValue: any, oldValue: any, type: TriggerOpTypes, watchPath: WatchPath) {
        super.handle(newValue, oldValue, type, watchPath);
    }
}