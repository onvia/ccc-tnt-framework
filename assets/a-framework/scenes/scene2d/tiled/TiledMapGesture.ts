
import { _decorator, Node, Vec2, Vec3, Event, EventTouch, Touch, EventMouse, Camera, misc, macro, Component, Size } from 'cc';
const { ccclass } = _decorator;


declare global {

    interface ITmx {
        TiledMapGesture: typeof TiledMapGesture;
    }

    namespace tnt {
        namespace tmx {
            type TiledMapGesture = InstanceType<typeof TiledMapGesture>;
        }
    }
}


interface CameraOptions {
    minZoomRatio?: number; // 最小缩放系数 默认 1
    maxZoomRatio?: number; // 最大缩放系数 默认 3
    increaseRate?: number; // 鼠标缩放系数 默认 10000
    getCameraTargetZoomRatio(): number; // 缩放目标值
    getCameraCurrentZoomRatio(): number; // 当前缩放显示的值
    getCameraCurrentPosition(): Vec3; // 
    updateCameraPosition(position: Vec3);
    updateCameraZoomRatio(zoomRatio: number);
    onClick(worldPosition: Vec2);
}

const tmp1_v3 = new Vec3();
const tmp2_v3 = new Vec3();
const tmp3_v3 = new Vec3();
const tmp4_v3 = new Vec3();
const tmp5_v3 = new Vec3();
const tmp1_v2 = new Vec2();
const tmp2_v2 = new Vec2();


const touchWeakMap = new WeakMap();
@ccclass('TiledMapGesture')
class TiledMapGesture extends Component implements ITouch, IMouse {
    public gameCamera: Camera = null;
    private cameraOptions: CameraOptions = null;
    private touchIDArray: number[] = [];
    // 鼠标移动的距离
    private deltaXY = new Vec2();
    public location: Vec2 = new Vec2();

    private get minZoomRatio() {
        return this.cameraOptions.minZoomRatio || 1;
    }
    private get maxZoomRatio() {
        return this.cameraOptions.maxZoomRatio || 3;
    }
    private get increaseRate() {
        return this.cameraOptions.increaseRate || 10000;
    }

    private mapRoot: Node = null;
    private CACHE_ENABLE_MULTI_TOUCH = -1;

    private enableZoom: boolean = false;
    public cancelInnerEvents: boolean = true; // 设置在滑动时是否取消内部节点的事件
    private isDoCancelInnerEvents: boolean = false;

    static create(camera: Camera, options: CameraOptions) {
        let tiledMapGesture = camera.getComponent(TiledMapGesture);
        if (!tiledMapGesture) {
            tiledMapGesture = camera.addComponent(TiledMapGesture);
        }
        tiledMapGesture.gameCamera = camera;
        tiledMapGesture.cameraOptions = options;
        return tiledMapGesture;
    }



    /**
     *
     *
     * @param {Node} mapRoot
     * @param {boolean} enableZoom
     * @return {*} 
     * @memberof TiledMapGesture
     */
    enable(mapRoot: Node, enableZoom: boolean) {
        if (this.CACHE_ENABLE_MULTI_TOUCH != -1) {
            return;
        }
        this.CACHE_ENABLE_MULTI_TOUCH = macro.ENABLE_MULTI_TOUCH ? 1 : 0;
        macro.ENABLE_MULTI_TOUCH = true;
        this.enableZoom = enableZoom;

        this.mapRoot = mapRoot;
        tnt.touch.on(this, mapRoot, true);
        tnt.mouse.on(this, mapRoot, true);

    }
    disable() {
        if (this.CACHE_ENABLE_MULTI_TOUCH != -1) {
            macro.ENABLE_MULTI_TOUCH = !!this.CACHE_ENABLE_MULTI_TOUCH;
        }
        tnt.mouse.off(this, this.mapRoot);
        tnt.touch.off(this, this.mapRoot);
    }

    onTouchBegan(event: EventTouch) {
        let allTouches = event.getAllTouches();
        // 单点
        if (allTouches.length === 1) {
            console.log(`TiledMapGesture-> 单点`);
            touchWeakMap.set(allTouches[0], false);
            this.touchIDArray.push(event.getID());

            this.deltaXY.set(0, 0);
            this._stopPropagationIfTargetIsMe(event);
            return;
        }
        // 停止传递事件
        event.propagationStopped = true;

        // 多点触摸
        if (allTouches.length >= 2) {
            allTouches.forEach((touch) => {
                let find = this.touchIDArray.find((touchID) => {
                    return touch.getID() === touchID;
                });

                if (find === undefined) {
                    this.touchIDArray.push(touch.getID());
                    touchWeakMap.set(touch, false);
                }
            });
        }

    }
    onTouchMoved(event: EventTouch) {

        let allTouches = event.getAllTouches();

        this.location = event.getLocation();

        // 单指操作
        if (allTouches.length === 1) {
            let position = this.gameCamera.node.position;
            let delta = event.getUIDelta();
            let visualZoomRatio = this.cameraOptions.getCameraCurrentZoomRatio();
            tmp1_v3.set(position.x - delta.x / visualZoomRatio, position.y - delta.y / visualZoomRatio, position.z);
            this.deltaXY.x += Math.abs(delta.x);
            this.deltaXY.y += Math.abs(delta.y);

            this.cameraOptions.updateCameraPosition(tmp1_v3);

            this._onCancelInnerEvents(event, event.touch);
            return;
        }

        if (!this.enableZoom) {
            return;
        }
        // 停止传递事件
        event.propagationStopped = true;
        let gameCamera = this.gameCamera;

        // 双指操作
        if (this.touchIDArray.length === 2 && allTouches.length >= 2) {
            let touches = allTouches.filter((touch) => {
                return touch.getID() === this.touchIDArray[0] || touch.getID() === this.touchIDArray[1];
            });
            let touch1 = touches[0];
            let touch2 = touches[1];
            let touchPoint1 = touch1.getUILocation(tmp1_v2);
            let touchPoint2 = touch2.getUILocation(tmp2_v2);
            let delta1 = touch1.getDelta();
            let delta2 = touch2.getDelta();
            let distance: Vec2 = touchPoint1.subtract(touchPoint2);
            let delta: Vec2 = delta1.subtract(delta2);

            let scale: number = 1;
            let zoomRatio = this.cameraOptions.getCameraTargetZoomRatio();
            if (Math.abs(distance.x) > Math.abs(distance.y)) {
                scale = (distance.x + delta.x * 0.5) / distance.x * zoomRatio;
            } else {
                scale = (distance.y + delta.y * 0.5) / distance.y * zoomRatio;
            }


            // 这里使用第一个手指的位置作为缩放锚点
            let location = event.getUIStartLocation();
            let realPos = tmp1_v3;
            let screenPos: Vec3 = tmp2_v3.set(location.x, location.y, 0);
            gameCamera.screenToWorld(screenPos, realPos);
            realPos.z = 0;
            let targetPos = gameCamera.node.parent.uiTransform.convertToNodeSpaceAR(realPos, tmp3_v3);

            // console.log("TiledMapGesture-> screenPos:" + screenPos.toString());
            // console.log("TiledMapGesture-> realPos:" + realPos.toString());
            // console.log("TiledMapGesture-> targetPos:" + targetPos.toString());
            this.smooth(targetPos, scale);
            this.onCancelInnerEvents(event);
        }

        // 停止传递事件
        event.propagationStopped = true;
    }
    onTouchEnded(event: EventTouch) {
        if (event.simulate) {
            return;
        }
        if (this.touchIDArray.length === 1) {
            if (this.deltaXY.x < 3 && this.deltaXY.y < 3) {
                let location = event.getLocation();
                tmp1_v3.set(location.x, location.y);
                let worldPosition = this.gameCamera.screenToWorld(tmp1_v3, tmp2_v3);
                tmp1_v2.set(worldPosition.x, worldPosition.y);
                this.cameraOptions.onClick(tmp1_v2);
            }
            this._onStopPropagation(event);
        } else {
            if (this.enableZoom) {
                this._onStopPropagation(event);
            }
            // // 停止传递事件
            // event.propagationStopped = true;
        }
        this.touchIDArray.length = 0;
        this.isDoCancelInnerEvents = false;
    }

    onTouchCancel(event: EventTouch) {
        this.onTouchEnded(event);
    }

    onMouseDown(event: EventMouse) {

    }
    onMouseWheel(event: EventMouse) {
        let gameCamera = this.gameCamera;

        // //滑轮缩放大小
        let scale: number = this.cameraOptions.getCameraTargetZoomRatio() - event.getScrollY() / this.increaseRate * -1;
        let location: Vec2 = event.getLocation();
        // 转化
        let realPos = tmp1_v3;

        let screenPos: Vec3 = tmp2_v3.set(location.x, location.y, 1000);
        gameCamera.screenToWorld(screenPos, realPos);
        let targetPos = gameCamera.node.parent.uiTransform.convertToNodeSpaceAR(realPos, tmp3_v3);

        this.smooth(targetPos, scale);
    }

    private smooth(targetPos: Vec3, targetScale: number): void {
        if (targetScale > this.maxZoomRatio || targetScale < this.minZoomRatio) {
            return;
        }
        tmp4_v3.set(targetPos);
        tmp5_v3.set(targetPos);
        targetScale = misc.clampf(targetScale, this.minZoomRatio, this.maxZoomRatio);
        let uiTouchPos: Vec3 = tmp4_v3.subtract(this.cameraOptions.getCameraCurrentPosition()).multiplyScalar(this.cameraOptions.getCameraTargetZoomRatio());
        let mapPos: Vec3 = tmp5_v3.subtract(uiTouchPos.divide3f(targetScale, targetScale, targetScale));
        this.cameraOptions.updateCameraPosition(mapPos);
        this.cameraOptions.updateCameraZoomRatio(targetScale);
    }

    onMouseMove(event: EventMouse) {
        this.location = event.getLocation();
    }

    protected update(dt: number): void {
    }
    //#region ----------------------------不阻止内部节点的触摸事件-------------------------------------------------
    onCancelInnerEvents(event: EventTouch) {

        // Do not prevent touch events in inner nodes
        if (!this.cancelInnerEvents) {
            return;
        }
        if (this.isDoCancelInnerEvents) {
            return;
        }
        let allTouches = event.getTouches();
        this.isDoCancelInnerEvents = true;

        let touch1 = allTouches[0];
        let touch2 = allTouches[1];
        // 这里分开发送事件，否则会有一个不生效
        this._onCancelInnerEvents(event, touch1, false);
        this.scheduleOnce(() => {
            this._onCancelInnerEvents(event, touch2, false);
        });
    }

    private _onCancelInnerEvents(event: EventTouch, touch: Touch, checkDistance = true) {
        if (!this.cancelInnerEvents) {
            return;
        }

        const deltaMove = touch.getUILocation(tmp1_v2);
        deltaMove.subtract(touch.getUIStartLocation(tmp2_v2));
        //FIXME: touch move delta should be calculated by DPI.
        if (deltaMove.length() > 7 || !checkDistance) {

            let _touchMoved = touchWeakMap.get(touch);
            if (!_touchMoved && event.target !== this.mapRoot) {
                // Simulate touch cancel for target node
                let cancelEvent = new EventTouch(event.getTouches(), event.bubbles, Node.EventType.TOUCH_CANCEL);
                // cancelEvent.type = Node.EventType.TOUCH_CANCEL;
                cancelEvent.touch = touch; //event.touch;
                cancelEvent.simulate = true;
                event.target.dispatchEvent(cancelEvent);
                // this._touchMoved = true;
                touchWeakMap.set(touch, true);
                return true;
            }
        }
        return false;
    }
    _onStopPropagation(event: EventTouch) {
        let isAnyTouchMoved = false;
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            let _touchMoved = touchWeakMap.get(touch);
            if (_touchMoved == true) {
                isAnyTouchMoved = true;
                break;
            }
        }
        if (isAnyTouchMoved) {
            event.propagationStopped = true;
        } else {
            this._stopPropagationIfTargetIsMe(event);
        }
    }
    protected _stopPropagationIfTargetIsMe(event: Event) {
        if (event.eventPhase === Event.AT_TARGET && event.target === this.mapRoot) {
            event.propagationStopped = true;
        }
    }


    //#endregion ----------------------------不阻止内部节点的触摸事件-------------------------------------------------



}

tnt.tmx.TiledMapGesture = TiledMapGesture;

export { };