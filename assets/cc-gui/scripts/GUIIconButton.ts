import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button } = tnt._decorator;


declare global{
    interface GUIIconButtonOptions{
        
    }
}

//@prefabUrl("{bundle}#{path}/GUIIconButton")
@ccclass('GUIIconButton')
export class GUIIconButton extends tnt.UIItem<GUIIconButtonOptions> {
   
   
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
