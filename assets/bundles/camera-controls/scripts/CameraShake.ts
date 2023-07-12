import { Camera, Component, js, log, math, v3, Vec3, _decorator } from "cc";
import { EDITOR } from "cc/env";

const {ccclass,inspector,executeInEditMode, property} = _decorator;

@ccclass('ShakeParam')
export class ShakeParam {
    /** 最大震动数 */
    @property({  displayName: "最大震动数" })
    public numberOfShakes = 2;

    @property
    shakeAmount: Vec3 = v3(1,1,1);
    
 
    /** 震动距离 */
    @property({  displayName: '震动距离' })
    distance: number = 10;

    /** 速度 */
    @property({ displayName: '速度' })
    speed: number = 100;

    /** 衰减幅度 */
    @property({ displayName: '衰减幅度', range:[0.1,1], slide: true })
    decay: number = 0.2;

    /** 随机方向 */
    @property({ displayName: '随机方向'})
    randomSign = true;

    // 震动开始
    onShakeStartEvent: ()=> void;
    // 当前震动完成的回调事件
    onShakeCompleteEvent: ()=> void;

    copy(other: ShakeParam){
        for (let key in other) {
            this[key] = other[key];
        }
        return this;
    }
}

class ShakeState{

    // 当前震动计时
    timer: number = 0;
    startPosition: Vec3 = v3();
    shakePosition: Vec3 = v3();

    // 方向种子
    seed: Vec3 = v3(1,1,0);

    // 震动参数
    shakeParam: ShakeParam = null;


    constructor(startPosition: Vec3,shakeParam: ShakeParam){
        this.startPosition = v3(startPosition);
        this.shakeParam = shakeParam;
        if(shakeParam.randomSign){
            this.seed.x = Math.random() > 0.5 ? -1 : 1;
            this.seed.y = Math.random() > 0.5 ? -1 : 1;
            // this.seed.z = Math.random() > 0.5 ? -1 : 1;
        }
    }

}

@ccclass
@executeInEditMode
export default class CameraShake extends Component {

    @property(Camera)
    camera: Camera = null;
    
    @property(ShakeParam)
    shakeParam: ShakeParam = new ShakeParam();

    

    
    // 是否开启震动
    private _isShaking = false;
    public get isShaking() {
        return this._isShaking;
    }
    // 正在取消震动
    private _isCancelling = false;
    public get isCancelling() {
        return this._isCancelling;
    }
    private stateList: ShakeState [] = [];
    
    public static instance: CameraShake = null;

    onLoad(){
        CameraShake.instance = this;
    }
    start(){
        if(!this.camera){
            this.camera = this.node.getComponent(Camera);
        }
        if(EDITOR){
            // @ts-ignore
            Editor?.Utils?.refreshSelectedInspector?.('node', this.node.uuid);
        }
    }


    lateUpdate(dt){
        if(!this._isShaking){
            return;
        }
        for (let i = this.stateList.length; i--;) {
            const state = this.stateList[i];
            this.updateShake(dt,state);
        }
    }

    updateShake(dt: number,shakeState: ShakeState){
        let param = shakeState.shakeParam;
        shakeState.timer += dt;
        let timer = shakeState.timer * param.speed;
        shakeState.shakePosition = v3(
            shakeState.seed.x * Math.sin(timer) * (param.shakeAmount.x * param.distance),
            shakeState.seed.y * Math.cos(timer) * (param.shakeAmount.y * param.distance),
            0,
            // shakeState.seed.z * Math.sin(timer) * (param.shakeAmount.z * param.distance)
        );

        // 取消震动
        if(this.isCancelling){
            param.distance -= param.decay*dt;
            if(param.distance <= 0){
                this._isCancelling = false;
                param.numberOfShakes = 0;
            }
        }else{
            if (timer  > Math.PI * 2){
                shakeState.timer = 0;
                param.distance *= (1 - math.clamp01(param.decay));
                param.numberOfShakes --;
            }
        }

        this.camera.node.position = this.camera.node.position.add(shakeState.shakePosition);

        if(param.numberOfShakes === 0){
            param.onShakeCompleteEvent && param.onShakeCompleteEvent();
            js.array.remove(this.stateList,shakeState);
            if(this.stateList.length === 0){
                this._isShaking = false;
                log(`CameraShake-> 所有震动结束`);
            }
        }
    }
    
    // 震动
    doShake(_param?: ShakeParam){
        if(this.isCancelling){
            return;
        }
        this._isShaking = true;
        let param = new ShakeParam();
        param.copy(_param || this.shakeParam);
        this.stateList.push(new ShakeState(this.camera.node.position,param));
    }

    // 取消震动
    doCancelShake(time?){
        if(time){
            this._doCancelShakeByTime(time)
        }else{
            this._doCancelShakeImm();
        }
    }

    private _doCancelShakeByTime(time){
        if(this._isShaking && !this.isCancelling){
            this._isCancelling = true;
            for (let i = this.stateList.length; i--;) {
                const state = this.stateList[i];
                let param = state.shakeParam;
                param.decay = param.distance / time;
            }
        }
    }

    private _doCancelShakeImm(){
        if(this._isShaking && !this.isCancelling){
            this._isShaking = false;
            for (let i = this.stateList.length; i--;) {
                const state = this.stateList[i];
                this.camera.node.position = this.camera.node.position.subtract(state.shakePosition);
            }
            this.stateList.length = 0;
        }
    }
    


    static shake(param?: ShakeParam){
        let self = CameraShake.instance;
        if(!self){
            return;
        }
        self.doShake(param);
    }
    
    static cancelShake(time?: number){
        let self = CameraShake.instance;
        if(!self){
            return;
        }
        self.doCancelShake(time);
    }

}
