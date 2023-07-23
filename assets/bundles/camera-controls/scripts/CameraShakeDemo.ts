
import { _decorator, v3 } from "cc";
import CameraShake, { ShakeParam } from "./CameraShake";
const { ccclass, property } = _decorator;

@ccclass('CameraShakeDemo')
export class CameraShakeDemo extends tnt.SceneBase {

    private _shootShake: ShakeParam = null;
    public get shootShake(): ShakeParam {
        if(!this._shootShake){
            let shootShake = new ShakeParam();
            shootShake.numberOfShakes = 1;
            shootShake.shakeAmount = v3(1,0,0);
            shootShake.distance = 5;
            shootShake.speed = 100;
            shootShake.decay = 0.2;
            shootShake.randomSign = false;
            this._shootShake = shootShake;
        }
        return this._shootShake;
    }

    private _bombShake: ShakeParam = null;
    public get bombShake(): ShakeParam {
        if(!this._shootShake){
            let bombShake = new ShakeParam();
            bombShake.numberOfShakes = 4;
            bombShake.shakeAmount = v3(0.3,1,0);
            bombShake.distance = 10;
            bombShake.speed = 30;
            bombShake.decay = 0.6;
            bombShake.randomSign = true;
            this._bombShake = bombShake;
        }
        return this._bombShake;
    }
    onEnter(): void {
        this.registerButtonClick("btnBoom", () => {
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
