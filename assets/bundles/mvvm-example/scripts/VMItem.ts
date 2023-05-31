import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
const { prefabUrl } = tnt._decorator;

@prefabUrl("mvvm-example#prefabs/VMItem")
@ccclass('VMItem')
export class VMItem extends tnt.UIItem implements IVMItem {

    start() {

    }

    updateItem(data: any, index: number, ...args: any[]) {
        this.setLabelText("Label", `${data.name} ${index}`);
    }
}

