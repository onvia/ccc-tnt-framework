import { _decorator, Node, tween, Tween, game } from "cc";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, button } = tnt._decorator;


declare global{
    interface LoadingTipsOptions{
        
    }
}

@prefabUrl("common-bundle#prefabs/LoadingTips")
@ccclass('LoadingTips')
export class LoadingTips extends tnt.UIPanel<LoadingTipsOptions> {
   
   
    @node()
    loading: Node = null;

	  
    public onCreate(): void {
        
    }
    
    protected onStart(): void {
        tween(this.loading).repeatForever(tween(this.loading).by(0.8,{angle: -360}).by(0.8,{angle: -360})).start();
    }
    protected onEnable(): void {
        this.loading.active = false;
        // 下一帧才显示 loading 动画
        tween(this).delay(game.deltaTime).call(()=>{
            this.loading.active = true;
        }).start();
    }
    protected onDisable(): void {
        Tween.stopAllByTarget(this);
    }
}
