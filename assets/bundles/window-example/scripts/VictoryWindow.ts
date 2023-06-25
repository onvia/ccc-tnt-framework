import { _decorator, Color } from "cc";

const { ccclass, property } = _decorator;
let { prefabUrl } = tnt._decorator;



declare global{
    interface VictoryWindowOptions{
        awards: any[];
    }
}

@prefabUrl("window-example#prefabs/VictoryWindow")
@ccclass('VictoryWindow')
export class VictoryWindow extends tnt.UIWindow {

 
    public onCreate(): void {
        
        this.setTopMenuBar({color: Color.RED});
        this.setHideOtherWindows(true);
    }
    
    onStart(): void {
        console.log(`VictoryWindow-> onInit`);
        this.registeButtonClick("btnClose",()=>{
            this.close();
        });
    }
    
    onActive(): void {
        console.log(`VictoryWindow-> onActive`);
    }
    onFreeze(): void {
        console.log(`VictoryWindow-> onFreeze`);
    }
    
    onShowCallback(){
        console.log(`VictoryWindow-> onShowCallback`);
        
    }
    onCloseCallback(){
        console.log(`VictoryWindow-> onCloseCallback`);
    }

    // update (deltaTime: number) {
    // }
}
