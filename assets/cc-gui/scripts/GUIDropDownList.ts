import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button } = tnt._decorator;


declare global{
    interface GUIDropDownListOptions{
        
    }
}

//@prefabUrl("{bundle}#{path}/GUIDropDownList")
@ccclass('GUIDropDownList')
export class GUIDropDownList extends tnt.UIItem<GUIDropDownListOptions> {
   
   
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
