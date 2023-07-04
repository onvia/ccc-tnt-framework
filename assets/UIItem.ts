import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
let { prefabUrl, node, sprite, button } = tnt._decorator;


declare global{
    interface UIItemOptions{
        
    }
}

//@prefabUrl("{bundle}#{path}/UIItem")
@ccclass('UIItem')
export class UIItem extends tnt.UIItem<UIItemOptions> {
   
   
    //@node("node-name")
    //node: Node = null;

    //@sprite("node-name")
    //sprite: Sprite = null;
    
	  
    public onCreate(): void {
        
    }
    
    protected onStart(): void {
        
    }

    
    //protected update(dt: number): void {
    //    
    //}
}
