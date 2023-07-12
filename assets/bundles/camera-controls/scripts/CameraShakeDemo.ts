
import { _decorator, v3 } from "cc";
import CameraShake, { ShakeParam } from "./CameraShake";
const { ccclass, property } = _decorator;

@ccclass('CameraShakeDemo')
export class CameraShakeDemo extends tnt.SceneBase {

    private _shootShake: ShakeParam = null;
    public get shootShake(): ShakeParam {
        if(!this._shootShake){
            let shakeParam = new ShakeParam();
            shakeParam.numberOfShakes = 1;
            shakeParam.shakeAmount = v3(1,0,0);
            shakeParam.distance = 5;
            shakeParam.speed = 100;
            shakeParam.decay = 0.2;
            shakeParam.randomSign = false;
            this._shootShake = shakeParam;
        }
        return this._shootShake;
    }

    private _bombShake: ShakeParam = null;
    public get bombShake(): ShakeParam {
        if(!this._shootShake){
            let shakeParam = new ShakeParam();
            shakeParam.numberOfShakes = 4;
            shakeParam.shakeAmount = v3(0.3,1,0);
            shakeParam.distance = 10;
            shakeParam.speed = 30;
            shakeParam.decay = 0.6;
            shakeParam.randomSign = true;
            this._bombShake = shakeParam;
        }
        return this._bombShake;
    }
    onEnter(): void {
        this.registeButtonClick("btnBoom", () => {
            CameraShake.shake(this.bombShake);
        });

        tnt.touch.onLongPress(this.find("btnShoot"),()=>{
            CameraShake.shake(this.shootShake);
        },this);
    }

    onExitTransitionStart(sceneName?: string): void {
        tnt.touch.offLongPress(this.find("btnShoot"));
    }
    onExit(): void {
        
    }
    
}
