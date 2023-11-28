import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global{
    interface ShaderTestOptions{
        
    }
}

@ccclass('ShaderTest')
export class ShaderTest extends tnt.SceneBase<ShaderTestOptions> {
   
    onEnter(): void {
        
    }
    
    onExit(): void {
        
    }
	  
    //protected update(dt: number): void {
    //    
    //}
}
