import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
const { prefabUrl } = tnt._decorator;

declare global {
    interface UIEmbedItemOptions {
        name: string;
    }
}
@prefabUrl("window-example#prefabs/items/UIEmbedItem")
@ccclass('UIEmbedItem')
export class UIEmbedItem extends tnt.UIItem<UIEmbedItemOptions> {

    protected onStart(): void {

    }

}

