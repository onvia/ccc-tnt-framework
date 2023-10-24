
import { _decorator, Node, Vec2, Vec3, EventTouch, EventMouse, Camera, misc, macro } from 'cc';
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

const weakMap = new WeakMap<Camera, TiledMapGesture>();
@ccclass('TiledMapGesture')
class TiledMapGesture implements ITouch, IMouse {
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

    private touchNode: Node = null;
    private CACHE_ENABLE_MULTI_TOUCH = -1;


    static create(camera: Camera, options: CameraOptions) {
        let tiledMapGesture: TiledMapGesture = null
        if (weakMap.has(camera)) {
            tiledMapGesture = weakMap.get(camera);

            tiledMapGesture.onCtor(camera, options);
        } else {

            tiledMapGesture = new TiledMapGesture(camera, options);
            weakMap.set(camera, tiledMapGesture);
        }
        return tiledMapGesture;
    }

    constructor(camera: Camera, options: CameraOptions) {
        this.onCtor(camera, options);
    }
    onCtor(camera: Camera, options: CameraOptions) {
        

        this.gameCamera = camera;
        this.cameraOptions = options;
    }

    enable(touchNode: Node) {
        if (this.CACHE_ENABLE_MULTI_TOUCH != -1) {
            return;
        }
        this.CACHE_ENABLE_MULTI_TOUCH = macro.ENABLE_MULTI_TOUCH ? 1 : 0;
        macro.ENABLE_MULTI_TOUCH = true;

        this.touchNode = touchNode;
        tnt.mouse.on(this, touchNode);
        tnt.touch.on(this, touchNode);
    }
    disable() {
        if (this.CACHE_ENABLE_MULTI_TOUCH != -1) {
            macro.ENABLE_MULTI_TOUCH = !!this.CACHE_ENABLE_MULTI_TOUCH;
        }
        tnt.mouse.off(this, this.touchNode);
        tnt.touch.off(this, this.touchNode);
    }

    onTouchBegan(event: EventTouch) {
        let allTouches = event.getAllTouches();
        // 单点
        if (allTouches.length === 1) {
            console.log(`TiledMapGesture-> 单点`);
            this.touchIDArray.push(event.getID());

            this.deltaXY.set(0, 0);
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
            let touchPoint1 = touch1.getLocation();
            let touchPoint2 = touch2.getLocation();
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
            let location = event.getStartLocation();
            let realPos = tmp1_v3;
            let screenPos: Vec3 = tmp2_v3.set(location.x, location.y, 0);
            gameCamera.screenToWorld(screenPos, realPos);
            realPos.z = 0;
            let targetPos = gameCamera.node.parent.uiTransform.convertToNodeSpaceAR(realPos, tmp3_v3);

            // console.log("TiledMapGesture-> screenPos:" + screenPos.toString());
            // console.log("TiledMapGesture-> realPos:" + realPos.toString());
            // console.log("TiledMapGesture-> targetPos:" + targetPos.toString());
            this.smooth(targetPos, scale);
        }
    }
    onTouchEnded(event: EventTouch) {
        if (this.touchIDArray.length === 1) {
            if (this.deltaXY.x < 3 && this.deltaXY.y < 3) {
                let location = event.getLocation();
                tmp1_v3.set(location.x, location.y);
                let worldPosition = this.gameCamera.screenToWorld(tmp1_v3, tmp2_v3);
                tmp1_v2.set(worldPosition.x,worldPosition.y);
                this.cameraOptions.onClick(tmp1_v2);
            }
        } else {
            // 停止传递事件
            event.propagationStopped = true;
        }
        this.touchIDArray.length = 0;
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
}

tnt.tmx.TiledMapGesture = TiledMapGesture;

export { };