import { _decorator, Component, Node } from 'cc';
import { VMEventAttr, WatchPath } from '../_mv_declare';
import { VMBaseImplHandler } from './VMBaseImplHandler';
const { ccclass, property } = _decorator;

@ccclass('VMEventHandler')
export class VMEventHandler extends VMBaseImplHandler {
    public declare attr: VMEventAttr;

    protected async _updateValue(newValue: any, oldValue: any, watchPath: WatchPath): Promise<void> {
        this.attr.onChange({
            newValue,
            oldValue,
            watchPath,
            handler: this,
            attr: this.attr,
        });
    }

}

