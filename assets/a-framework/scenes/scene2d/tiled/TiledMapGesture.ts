
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


interface Options {
    minZoomRatio?: number; // 最小缩放系数 默认 1
    maxZoomRatio?: number; // 最大缩放系数 默认 3
    increaseRate?: number; // 鼠标缩放系数 默认 10000
    brake?: number; // 在用户停止触摸后滚动多快停止，0表示永不停止，1表示立刻停止。 默认 BRAKE
    cancelInnerEvents?: boolean; // 在滑动时是否取消内部节点的事件 默认为 true
    getCameraTargetZoomRatio(): number; // 缩放目标值
    getCameraCurrentZoomRatio(): number; // 当前缩放显示的值
    getCameraCurrentPosition(): Vec3; // 
    updateCameraPosition(position: Vec3);
    updateCameraZoomRatio(zoomRatio: number);
    onClick(worldPosition: Vec2);
}

const NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED = 5;
const OUT_OF_BOUNDARY_BREAKING_FACTOR = 0.05;
const EPSILON = 1e-3;
const MOVEMENT_FACTOR = 0.7;
const BRAKE = 0.75; // 在用户停止触摸后滚动多快停止，0表示永不停止，1表示立刻停止。
const tmp1_v3 = new Vec3();
const tmp2_v3 = new Vec3();
const tmp3_v3 = new Vec3();
const tmp4_v3 = new Vec3();
const tmp5_v3 = new Vec3();
const tmp1_v2 = new Vec2();
const tmp2_v2 = new Vec2();


const _tempVec3 = new Vec3();
const _tempVec3_1 = new Vec3();
const _tempVec2 = new Vec2();
const _tempVec2_1 = new Vec2();

let quintEaseOut = function (time) {
    time -= 1;
    return (time * time * time * time * time + 1);
};

let getTimeInMilliseconds = function () {
    let currentTime = new Date();
    return currentTime.getMilliseconds();
};

const touchWeakMap = new WeakMap();
@ccclass('TiledMapGesture')
class TiledMapGesture extends Component implements ITouch, IMouse {
    public gameCamera: Camera = null;
    private options: Options = null;
    private touchIDArray: number[] = [];
    // 鼠标移动的距离
    private deltaXY = new Vec2();
    public location: Vec2 = new Vec2();

    private get minZoomRatio() {
        return this.options.minZoomRatio || 1;
    }
    private get maxZoomRatio() {
        return this.options.maxZoomRatio || 3;
    }
    private get increaseRate() {
        return this.options.increaseRate || 10000;
    }

    private mapRoot: Node = null;
    private CACHE_ENABLE_MULTI_TOUCH = -1;

    private enableZoom: boolean = false;
    public cancelInnerEvents: boolean = true; // 设置在滑动时是否取消内部节点的事件
    private isDoCancelInnerEvents: boolean = false;

    static create(camera: Camera, options: Options) {
        let tiledMapGesture = camera.getComponent(TiledMapGesture);
        if (!tiledMapGesture) {
            tiledMapGesture = camera.addComponent(TiledMapGesture);
        }
        tiledMapGesture.gameCamera = camera;
        tiledMapGesture.options = options;
        tiledMapGesture.brake = options.brake ?? BRAKE;
        tiledMapGesture.cancelInnerEvents = options.cancelInnerEvents ?? true;
        return tiledMapGesture;
    }


    private _autoScrolling = false;
    private _touchMoveDisplacements: Vec3[] = [];
    private _touchMoveTimeDeltas: number[] = [];
    private _touchMovePreviousTimestamp = 0;
    private _autoScrollAttenuate = false;
    private _autoScrollStartPosition = new Vec3();
    private _autoScrollTargetDelta = new Vec3();
    private _autoScrollTotalTime = 0;
    private _autoScrollAccumulatedTime = 0;

    private _autoScrollBrakingStartPosition = new Vec3();
    private _deltaPos = new Vec3();
    public brake = BRAKE; // 在用户停止触摸后滚动多快停止，0表示永不停止，1表示立刻停止。

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
            let touch = event.touch;
            console.log(`TiledMapGesture-> 单点`);
            touchWeakMap.set(touch, false);
            this.touchIDArray.push(event.getID());

            // 首次触摸才触发 
            if (this.touchIDArray.length == 1) {
                this._handlePressLogic();
            }

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


            let touch = event.touch;
            this._handleMoveLogic(touch);

            // let position = this.gameCamera.node.position;
            // let delta = event.getUIDelta();
            // let visualZoomRatio = this.cameraOptions.getCameraCurrentZoomRatio();
            // tmp1_v3.set(position.x - delta.x / visualZoomRatio, position.y - delta.y / visualZoomRatio, position.z);
            // this.deltaXY.x += Math.abs(delta.x);
            // this.deltaXY.y += Math.abs(delta.y);

            // this.cameraOptions.updateCameraPosition(tmp1_v3);

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
            let zoomRatio = this.options.getCameraTargetZoomRatio();
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
                this.options.onClick(tmp1_v2);
            } else {
                this._handleReleaseLogic(event.touch);
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
        let scale: number = this.options.getCameraTargetZoomRatio() - event.getScrollY() / this.increaseRate * -1;
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
        let uiTouchPos: Vec3 = tmp4_v3.subtract(this.options.getCameraCurrentPosition()).multiplyScalar(this.options.getCameraTargetZoomRatio());
        let mapPos: Vec3 = tmp5_v3.subtract(uiTouchPos.divide3f(targetScale, targetScale, targetScale));
        this.options.updateCameraPosition(mapPos);
        this.options.updateCameraZoomRatio(targetScale);
    }

    onMouseMove(event: EventMouse) {
        this.location = event.getLocation();
    }

    protected update(dt: number): void {
        if (this._autoScrolling) {
            this._processAutoScrolling(dt);
        }
    }
    //#region ----------------------------不阻止内部节点的触摸事件-------------------------------------------------
    protected onCancelInnerEvents(event: EventTouch) {

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
    private _onStopPropagation(event: EventTouch) {
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




    //#region --------------------------------- 滑动惯性 --------------------------------------------------------------

    private _moveContent(deltaMove: Vec3, canStartBounceBack?: boolean) {

        let position = this.gameCamera.node.position;
        // let prePosition = position;
        // let bgNode = this.bgNode;
        // let winSize = display.getWinSize();
        // let maxPosX = bgNode.width / 2 - winSize.width / 2;
        // let tmpX = bgNode.x + offsetPosX;
        // if (tmpX > maxPosX) {
        //     this._autoScrolling = false;
        //     tmpX = maxPosX;
        // } else if (tmpX < -maxPosX) {
        //     this._autoScrolling = false;
        //     tmpX = -maxPosX;
        // }

        // if (bgNode.x == tmpX) {
        //     return;
        // }
        // bgNode.x = tmpX;


        let delta = deltaMove;
        // console.log(`TiledMapGesture->delta `, delta.toString());

        let visualZoomRatio = this.options.getCameraCurrentZoomRatio();
        tmp1_v3.x = (position.x + delta.x / visualZoomRatio);
        tmp1_v3.y = (position.y + delta.y / visualZoomRatio);
        tmp1_v3.z = position.z
        this.deltaXY.x += Math.abs(delta.x);
        this.deltaXY.y += Math.abs(delta.y);

        this.options.updateCameraPosition(tmp1_v3);
    }
    private _handlePressLogic() {
        this._autoScrolling = false;
        this._touchMovePreviousTimestamp = getTimeInMilliseconds();
        this._touchMoveDisplacements.length = 0;
        this._touchMoveTimeDeltas.length = 0;
    }
    private _handleMoveLogic(touch) {
        let deltaMove = this._getLocalAxisAlignDelta(this._deltaPos, touch);
        // 相机移动方向与正常的节点移动方向相反，这里进行反转方向
        deltaMove.x *= -1;
        deltaMove.y *= -1;
        this._processDeltaMove(deltaMove);
    }
    private _handleReleaseLogic(touch) {

        let delta = this._getLocalAxisAlignDelta(this._deltaPos, touch);
        this._gatherTouchMove(delta);
        this._processInertiaScroll();
    }
    private _getLocalAxisAlignDelta(out: Vec3, touch: Touch) {
        const uiTransformComp = this.node._uiProps.uiTransformComp;
        const vec = new Vec3();

        if (uiTransformComp) {
            touch.getUILocation(_tempVec2);
            touch.getUIPreviousLocation(_tempVec2_1);
            _tempVec3.set(_tempVec2.x, _tempVec2.y, 0);
            _tempVec3_1.set(_tempVec2_1.x, _tempVec2_1.y, 0);
            uiTransformComp.convertToNodeSpaceAR(_tempVec3, _tempVec3);
            uiTransformComp.convertToNodeSpaceAR(_tempVec3_1, _tempVec3_1);
            Vec3.subtract(vec, _tempVec3, _tempVec3_1);
        }

        out.set(vec);
        return out;
    }
    private _processDeltaMove(deltaMove: Vec3) {
        this._moveContent(deltaMove);
        this._gatherTouchMove(deltaMove);
    }
    private _gatherTouchMove(delta: Vec3) {
        const clampDt = delta.clone();

        while (this._touchMoveDisplacements.length >= NUMBER_OF_GATHERED_TOUCHES_FOR_MOVE_SPEED) {
            this._touchMoveDisplacements.shift();
            this._touchMoveTimeDeltas.shift();
        }

        this._touchMoveDisplacements.push(clampDt);

        const timeStamp = getTimeInMilliseconds();
        this._touchMoveTimeDeltas.push((timeStamp - this._touchMovePreviousTimestamp) / 1000);
        this._touchMovePreviousTimestamp = timeStamp;
    }
    private _processInertiaScroll() {
        const touchMoveVelocity = this._calculateTouchMoveVelocity();
        if (!touchMoveVelocity.equals(_tempVec3, EPSILON) && this.brake < 1) {
            this._startInertiaScroll(touchMoveVelocity);
        }
    }

    private _calculateTouchMoveVelocity() {
        const out = new Vec3();
        let totalTime = 0;
        totalTime = this._touchMoveTimeDeltas.reduce((a, b) => a + b, totalTime);

        if (totalTime <= 0 || totalTime >= 0.5) {
            out.set(Vec3.ZERO);
        } else {
            let totalMovement = new Vec3();
            totalMovement = this._touchMoveDisplacements.reduce((a, b) => {
                a.add(b);
                return a;
            }, totalMovement);

            out.set(totalMovement.x * (1 - this.brake) / totalTime,
                totalMovement.y * (1 - this.brake) / totalTime, totalMovement.z);
        }
        return out;
    }
    private _startInertiaScroll(touchMoveVelocity: Vec3) {
        const inertiaTotalMovement = new Vec3(touchMoveVelocity);
        inertiaTotalMovement.multiplyScalar(MOVEMENT_FACTOR);
        this._startAttenuatingAutoScroll(inertiaTotalMovement, touchMoveVelocity);
    }
    private _startAttenuatingAutoScroll(deltaMove: Vec3, initialVelocity: Vec3) {

        const targetDelta = deltaMove.clone();
        targetDelta.normalize();

        const originalMoveLength = deltaMove.length();
        let factor = targetDelta.length() / originalMoveLength;
        targetDelta.add(deltaMove);

        if (this.brake > 0 && factor > 7) {
            factor = Math.sqrt(factor);
            const clonedDeltaMove = deltaMove.clone();
            clonedDeltaMove.multiplyScalar(factor);
            targetDelta.set(clonedDeltaMove);
            targetDelta.add(deltaMove);
        }

        let time = this._calculateAutoScrollTimeByInitialSpeed(initialVelocity.length());
        if (this.brake > 0 && factor > 3) {
            factor = 3;
            time *= factor;
        }

        if (this.brake === 0 && factor > 1) {
            time *= factor;
        }

        this._startAutoScroll(targetDelta, time, true);

    }

    private _calculateAutoScrollTimeByInitialSpeed(initialSpeed: number) {
        return Math.sqrt(Math.sqrt(initialSpeed / 5));
    }

    private _getContentPosition() {
        return this.options.getCameraCurrentPosition().clone();
    }
    private _startAutoScroll(deltaMove: Vec3, timeInSecond: number, attenuated = false) {
        const adjustedDeltaMove = deltaMove;

        this._autoScrolling = true;
        this._autoScrollTargetDelta = adjustedDeltaMove;
        this._autoScrollAttenuate = attenuated;
        Vec3.copy(this._autoScrollStartPosition, this._getContentPosition());
        this._autoScrollTotalTime = timeInSecond;
        this._autoScrollAccumulatedTime = 0;
        this._autoScrollBrakingStartPosition.set(0, 0, 0);

    }
    _processAutoScrolling(dt) {
        let isAutoScrollBrake = false;
        let brakingFactor = isAutoScrollBrake ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1;
        this._autoScrollAccumulatedTime += dt * (1 / brakingFactor);
        let percentage = Math.min(1, this._autoScrollAccumulatedTime / this._autoScrollTotalTime);
        if (this._autoScrollAttenuate) {
            percentage = quintEaseOut(percentage);
        }

        const clonedAutoScrollTargetDelta = this._autoScrollTargetDelta.clone();
        clonedAutoScrollTargetDelta.multiplyScalar(percentage);
        const clonedAutoScrollStartPosition = this._autoScrollStartPosition.clone();
        clonedAutoScrollStartPosition.add(clonedAutoScrollTargetDelta);
        let reachedEnd = Math.abs(percentage - 1) <= EPSILON;



        if (reachedEnd) {
            this._autoScrolling = false;
        }
        const deltaMove = clonedAutoScrollStartPosition.clone();
        deltaMove.subtract(this._getContentPosition());

        this._moveContent(deltaMove, reachedEnd);
    }

    //#endregion  --------------------------------- 滑动惯性 ----------------------------------------------------------
}

tnt.tmx.TiledMapGesture = TiledMapGesture;

export { };