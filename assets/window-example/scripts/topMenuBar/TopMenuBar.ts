import { Sprite, _decorator } from "cc";
let { ccclass } = _decorator;
let { prefabUrl, sprite } = tnt._decorator;

declare global {
    interface ITopMenuBarOptions {
        view: tnt.UIWindowBase;
    }
}

@prefabUrl("window-example#prefabs/topMenuBar/TopMenuBar")
@ccclass("TopMenuBar")
export class TopMenuBar extends tnt.UIBase<ITopMenuBarOptions>{


    @sprite()
    item1: Sprite = null;

    
    public onStart(): void {
        this.registeButtonClick("btnClose", this.onClickClose, this);
    }

    updateTopMenuBar(options: ITopMenuBarOptions) {
        this.options = options;

        // @ts-ignore
        this.item1.color = options.color;
    }

    onClickClose() {
        if (this.options.view) {
            this.options.view.close();
        } else {

        }
    }
}
