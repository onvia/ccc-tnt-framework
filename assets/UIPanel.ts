import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
let { prefabUrl, node, sprite, button } = tnt._decorator;


declare global{
    interface UIPanelOptions{
        
    }
}

//@prefabUrl("{bundle}#{path}/UIPanel")
@ccclass('UIPanel')
export class UIPanel extends tnt.UIPanel<UIPanelOptions> {
   
   
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
