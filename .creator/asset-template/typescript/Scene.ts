import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global{
    interface <%UnderscoreCaseClassName%>Options{
        
    }
}

@ccclass('<%UnderscoreCaseClassName%>')
export class <%UnderscoreCaseClassName%> extends tnt.SceneBase<<%UnderscoreCaseClassName%>Options> {
   
    onEnter(): void {
        
    }
    
    onExit(): void {
        
    }
	  
    //protected update(dt: number): void {
    //    
    //}
}
