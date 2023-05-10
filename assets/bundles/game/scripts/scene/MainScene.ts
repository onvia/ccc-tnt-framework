import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends tnt.SceneBase {

    onEnterTransitionFinished(sceneName?: string): void {
     
        this.registeButtonClick("btnWindow",()=>{
                        
            tnt.sceneMgr.to('WindowScene',{bundle: "window-example"});


        });
    }

}

