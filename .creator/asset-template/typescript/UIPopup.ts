import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
let { prefabUrl, node, sprite, button } = tnt._decorator;


declare global{
    interface <%UnderscoreCaseClassName%>Options{
        
    }
}

//@prefabUrl("{bundle}#{path}/<%UnderscoreCaseClassName%>")
@ccclass('<%UnderscoreCaseClassName%>')
export class <%UnderscoreCaseClassName%> extends tnt.UIPopup<<%UnderscoreCaseClassName%>Options> {
   
   
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
