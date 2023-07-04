import { _decorator, Node } from "cc";

const { ccclass } = _decorator;
let { node, sprite, button } = tnt._decorator;


declare global{
    interface SceneOptions{
        
    }
}

@ccclass('Scene')
export class Scene extends tnt.SceneBase<SceneOptions> {
   
   
    onEnter(): void {
        
    }
    
    onExit(): void {
        
    }

    //protected update(dt: number): void {
    //    
    //}
}
