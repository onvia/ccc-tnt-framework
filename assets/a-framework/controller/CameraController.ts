import { _decorator, Enum, Camera, Component, Size, Rect, view, UITransform, rect, Vec3, misc, Node, Vec2 } from "cc";

const { ccclass, property, requireComponent } = _decorator;
let tmp1_v3 = new Vec3();
let tmp2_v3 = new Vec3();
let tmp1_v2 = new Vec2();
let tmpCameraPos_v3 = new Vec3();


declare global {
    interface ITNT {
        CameraController: typeof CameraController;
    }

    namespace tnt {
        type CameraController = InstanceType<typeof CameraController>;

        namespace CameraController {
            type CameraState = CameraStateEnum;
        }
    }
}


enum CameraStateEnum {
    Free,
    Follow,
    MoveTo,
}
Enum(CameraStateEnum);

@ccclass
@requireComponent(Camera)
class CameraController extends Component {

    public static readonly CameraState = CameraStateEnum;
    public static readonly EVENT_CAMERA_ZOOM_RATIO_CHANGE = "camera-zoom-ratio-change";

    static create(gameCamera: Camera, mapSizeInPixel: Size) {
        let cameraController = gameCamera.getComponent(CameraController);
        if (!cameraController) {
            cameraController = gameCamera.addComponent(CameraController);
        }
        cameraController.mapSizeInPixel = mapSizeInPixel;
        cameraController.forceUpdateMovementArea();
        cameraController.forceUpdateCameraBounds();
        return cameraController;
    }

    @property({ tooltip: "跟随速率" })
    public followRatio = 0.016; // 跟随速率

    @property({ tooltip: "移动速度" })
    public moveSpeed: number = 500; // 移动速度

    @property({ tooltip: "缩放速度" })
    protected zoomSpeed: number = 3; // 缩放速度

    @property({ tooltip: "偏移值" })
    public offset: Vec3 = new Vec3(); // 偏移值

    // 摄像机状态
    @property({ type: CameraStateEnum })
    public cameraState: CameraStateEnum = CameraStateEnum.Free;

    public mapSizeInPixel: Size = null;
    protected _gapZoom = 0;
    protected _gapPosition: Vec3 = new Vec3();
    public bounds: Rect = null;
    protected transitionSpeed: Vec2 = new Vec2();
    public cameraZ = 1000;

    protected _preZoomRatio: number = 0;
    protected _visualZoomRatio: number = 0;
    public get visualZoomRatio(): number {
        return this._visualZoomRatio;
    }

    protected _zoomRatio: number = 1;
    public get zoomRatio(): number {
        return this._zoomRatio;
    }
    public set zoomRatio(value: number) {
        if (this._zoomRatio === value) {
            return;
        }
        this._zoomRatio = value;
        this._gapZoom = this._zoomRatio - this.cameraZoomRatio;
    }

    protected _cameraZoomRatio = -1;
    set cameraZoomRatio(value) {
        if (this._cameraZoomRatio === value) {
            return;
        }
        let size = view.getVisibleSize();
        this.camera.orthoHeight = size.height * 0.5 / value;
        this._cameraZoomRatio = value;
        this.node.emit(CameraController.EVENT_CAMERA_ZOOM_RATIO_CHANGE, value);
    }
    get cameraZoomRatio() {
        if (this._cameraZoomRatio === -1) {
            let size = view.getVisibleSize();
            this._cameraZoomRatio = size.height * 0.5 / this.camera.orthoHeight;
        }
        return this._cameraZoomRatio;
    }


    protected cameraParentUITransform: UITransform = null;
    protected cameraUITransform: UITransform = null;
    protected targetParentUITransform: UITransform = null;
    protected targetUITransform: UITransform = null;
    protected _camera: Camera;
    public get camera(): Camera {
        if (!this._camera) {
            this._camera = this.node.getComponent(Camera);
            if (!this._camera) {
                console.log(`CameraController-> 当前节点不存在 Camera`);
                return null;
            }
            this.cameraParentUITransform = this._camera.node.parent.getComponent(UITransform);
            this.cameraUITransform = this._camera.node.getComponent(UITransform);
            if (!this.cameraUITransform) {
                this.camera.node.addComponent(UITransform);
            }
        }
        return this._camera;
    }

    protected _prePosition: Vec3 = new Vec3();
    protected _visualPosition: Vec3 = new Vec3();
    public get visualPosition(): Vec3 {
        return this._visualPosition;
    }

    protected _position: Vec3 = new Vec3();
    public get position(): Vec3 {
        return this._position;
    }

    // 非公开属性
    protected set position(value: Vec3) {
        this._position = value.add(this.offset);
        this._gapPosition.x = this.position.x - this.camera.node.position.x;
        this._gapPosition.y = this.position.y - this.camera.node.position.y;

        this._gapPosition.z = 0;

        // 计算 移动到目标点的 速度
        let distance = this._gapPosition.length();
        let speed = this.moveSpeed;
        let speedX = speed * this._gapPosition.x / distance;
        let speedY = speed * this._gapPosition.y / distance;

        this.transitionSpeed.x = speedX;
        this.transitionSpeed.y = speedY;

        // this.zoomSpeed = speed / distance;
    }


    public get cameraWidth(): number {
        let size = view.getVisibleSize();
        return size.width / this.cameraZoomRatio;
    }

    public get cameraHeight(): number {
        let size = view.getVisibleSize();
        return size.height / this.cameraZoomRatio;
    }

    protected _limitObject: Node = null;
    protected _center: Vec2 = new Vec2();

    // 相机视图
    protected cameraBounds: Rect = rect();

    // moveTo 需要用到的属性
    public isMoveToDone = false;
    protected moveEndCallback: Runnable = null;


    @property(Node)
    protected _followNode: Node = null;


    @property({ visible() { return this.cameraState === CameraStateEnum.Follow } })
    public limit: Vec3 = new Vec3();

    @property({ type: Node, visible() { return this.cameraState === CameraStateEnum.Follow } })
    public get followNode(): Node {
        return this._followNode;
    }
    public set followNode(value: Node) {
        this._followNode = value;
        this._followUITransform = value.getComponent(UITransform);
    }
    isJustEnable = false;



    protected _followUITransform: UITransform = null;
    public get followUITransform(): UITransform {
        if (!this._followUITransform && this.followNode) {
            this._followUITransform = this.followNode.getComponent(UITransform);
        }
        return this._followUITransform;
    }


    public forceZoomRatio(value: number) {
        this._preZoomRatio = this.cameraZoomRatio;
        this.zoomRatio = value;
        this.cameraZoomRatio = value;
        this._visualZoomRatio = value;
        this.forceUpdateMovementArea();
        this.forceUpdateCameraBounds();
    }

    public forcePosition(value: Vec3, useLimit = false) {
        let bounds = this.bounds;
        if (useLimit && bounds) {
            // 限制相机 的移动范围
            value.x = misc.clampf(value.x, bounds.xMin, bounds.xMax);
            value.y = misc.clampf(value.y, bounds.yMin, bounds.yMax);
        }

        this.forceTransition(value);
        this.camera.node.position = new Vec3(value);
        this._gapPosition.set(Vec3.ZERO);
    }

    public forceTransition(value: Vec3) {
        this._prePosition.set(value);
        this.position = value;
        this._visualPosition.set(value);
    }

    start() {

    }
    onLoad() {

    }

    public moveTo(position: Vec3, zoomRatioOrCb?: number | (() => void), callback?: () => void) {
        this.cameraState = CameraStateEnum.MoveTo;
        this.position = position;
        if (callback) {
            this.moveEndCallback = callback;
        } else if (!callback && typeof zoomRatioOrCb === 'function') {
            this.moveEndCallback = zoomRatioOrCb;
        }

        if (typeof zoomRatioOrCb === 'number') {
            this.zoomRatio = zoomRatioOrCb;
        }
        this.isMoveToDone = false;
    }

    public follow(target: Node) {
        this.followNode = target;
        this.cameraState = CameraStateEnum.Follow;
    }

    public free(){
        this.cameraState = CameraStateEnum.Free;
    }

    protected computeZoomRatio(dt) {
        let zoomRatio = 1;
        if (this._gapZoom > 0) {
            zoomRatio = Math.min(this.cameraZoomRatio + this._gapZoom * dt * this.zoomSpeed, this.zoomRatio);
        } else if (this._gapZoom < 0) {
            zoomRatio = Math.max(this.cameraZoomRatio + this._gapZoom * dt * this.zoomSpeed, this.zoomRatio);
        }
        return zoomRatio;
    }

    protected computePosition(dt) {
        let targetPosition: Vec3 = this.position;

        let curPosition = this.camera.node.position;

        let speed = this.transitionSpeed;
        if (this._gapPosition.x > 0) {
            tmpCameraPos_v3.x = Math.min(curPosition.x + speed.x * dt, targetPosition.x);
        } else if (this._gapPosition.x < 0) {
            tmpCameraPos_v3.x = Math.max(curPosition.x + speed.x * dt, targetPosition.x);
        } else {
            tmpCameraPos_v3.x = curPosition.x;
        }

        if (this._gapPosition.y > 0) {
            tmpCameraPos_v3.y = Math.min(curPosition.y + speed.y * dt, targetPosition.y);
        } else if (this._gapPosition.y < 0) {
            tmpCameraPos_v3.y = Math.max(curPosition.y + speed.y * dt, targetPosition.y);
        } else {
            tmpCameraPos_v3.y = curPosition.y;
        }

        return tmpCameraPos_v3;

    }

    protected computePositionForMoveTo(dt) {
        let curPosition = this.computePosition(dt);
        if (!this.isMoveToDone) {
            if (Math.abs(curPosition.x - this.visualPosition.x) < 1 && Math.abs(curPosition.y - this.visualPosition.y) < 1) {
                this.isMoveToDone = true;
                this.cameraState = CameraStateEnum.Free;
                this.moveEndCallback?.();
            }
        }
        return curPosition;
    }

    protected computePositionForFollow(dt) {

        let followPosition: Vec3 = this.position;
        if (this.followNode) {
            let _worldPosition = this.followUITransform.convertToWorldSpaceAR(Vec3.ZERO, followPosition);
            _worldPosition = this.cameraParentUITransform.convertToNodeSpaceAR(_worldPosition, _worldPosition);
            followPosition = _worldPosition;
        }

        this.position = followPosition;

        tmpCameraPos_v3 = this.computePosition(dt);

        if (this.isJustEnable) {
            // 判断是否距离用户很远
            if (tmpCameraPos_v3.x > followPosition.x - this.limit.x && tmpCameraPos_v3.x < followPosition.x + this.limit.x
                && tmpCameraPos_v3.y > followPosition.y - this.limit.y && tmpCameraPos_v3.y < followPosition.y + this.limit.y) {
                this.isJustEnable = false;
                // this.moveSpeed = 500;
            } else {
                // 重新计算位移，使摄像机快速追上 目标
                let curPosition = this.camera.node.position;
                tmpCameraPos_v3 = curPosition.lerp(followPosition, this.followRatio);
            }
        } else {
            // 限制相机与角色的距离
            tmpCameraPos_v3.x = misc.clampf(tmpCameraPos_v3.x, followPosition.x - this.limit.x, followPosition.x + this.limit.x);
            tmpCameraPos_v3.y = misc.clampf(tmpCameraPos_v3.y, followPosition.y - this.limit.y, followPosition.y + this.limit.y);
        }

        return tmpCameraPos_v3;
    }

    protected _computePosition(dt) {
        let position = null;
        switch (this.cameraState) {
            case CameraStateEnum.Free:
                let curPosition = this.camera.node.position;
                tmpCameraPos_v3.x = curPosition.x;
                tmpCameraPos_v3.y = curPosition.y;
                position = tmpCameraPos_v3;
                break;
            case CameraStateEnum.MoveTo:
                position = this.computePositionForMoveTo(dt);
                break;
            case CameraStateEnum.Follow:
                position = this.computePositionForFollow(dt);
                break;

            default:
                position = this.computePosition(dt);
                break;
        }
        return position;
    }

    update(dt) {
        this._preZoomRatio = this.cameraZoomRatio;
        this.cameraZoomRatio = this.computeZoomRatio(dt);
        this._visualZoomRatio = this.cameraZoomRatio;
        this.updateMovementArea();

        this._prePosition.set(this.camera.node.position);
        tmpCameraPos_v3 = this._computePosition(dt);


        let bounds = this.bounds;
        if (bounds) {
            // 限制相机 的移动范围
            tmpCameraPos_v3.x = misc.clampf(tmpCameraPos_v3.x, bounds.xMin, bounds.xMax);
            tmpCameraPos_v3.y = misc.clampf(tmpCameraPos_v3.y, bounds.yMin, bounds.yMax);
        }

        tmpCameraPos_v3.z = this.cameraZ;
        this.camera.node.position = tmpCameraPos_v3;
        this._visualPosition.set(this.camera.node.position);

        this.updateCameraBounds();
    }

    protected updateMovementArea() {
        if (this._preZoomRatio === this._visualZoomRatio) {
            return;
        }
        this.forceUpdateMovementArea();
    }

    public forceUpdateMovementArea() {
        let mapSizeInPixel = this.mapSizeInPixel;
        if (!mapSizeInPixel) {
            console.log(`CameraController-> mapSizeInPixel 不存在`);
            return;
        }

        let cameraWidth = this.cameraWidth;
        let cameraHeight = this.cameraHeight;

        this.bounds = rect(0 + cameraWidth * 0.5, 0 + cameraHeight * 0.5, mapSizeInPixel.width - cameraWidth, mapSizeInPixel.height - cameraHeight);
    }
    protected updateCameraBounds() {

        if (this._preZoomRatio == this.cameraZoomRatio) {
            // 更新位置
            this._updateCameraCenter();
            return;
        }
        this.forceUpdateCameraBounds();
    }

    public forceUpdateCameraBounds() {
        // 摄像机视图
        this.cameraBounds.width = this.cameraWidth;
        this.cameraBounds.height = this.cameraHeight;
        this._updateCameraCenter(); // 先设置大小再设置位置
    }

    private _updateCameraCenter() {
        let _center = this._center;
        tmp1_v3 = this.cameraUITransform.convertToWorldSpaceAR(Vec3.ZERO, tmp1_v3);
        _center.set(tmp1_v3.x, tmp1_v3.y);
        // 更新位置
        this.cameraBounds.center = _center;
    }
    onEnable() {
        this.isJustEnable = true;
        this._gapZoom = this._zoomRatio - this.cameraZoomRatio;
        this._gapPosition.x = this.position.x - this.camera.node.position.x;
        this._gapPosition.y = this.position.y - this.camera.node.position.y;
        this._gapPosition.z = 0;

    }
    onDisable() {
    }




    // lateUpdate(){
    //     // 限制对象的位置
    //     if(this._limitObject){

    //         let bounds = this.cameraBounds;
    //         let target = this._limitObject;
    //         // 限制角色位置
    //         let minPos = new Vec3(bounds.x - this.cameraWidth * 0.5,bounds.y - this.cameraHeight * 0.5);
    //         let maxPos = new Vec3(bounds.x + this.cameraWidth * 0.5,bounds.y + this.cameraHeight * 0.5);

    //         minPos = this.cameraParentUITransform.convertToWorldSpaceAR(minPos,minPos);
    //         maxPos = this.cameraParentUITransform.convertToWorldSpaceAR(maxPos,maxPos);
    //         minPos = this.targetParentUITransform.convertToNodeSpaceAR(minPos,minPos);
    //         maxPos = this.targetParentUITransform.convertToNodeSpaceAR(maxPos,maxPos);

    //         let bounding = this.targetUITransform.getBoundingBox();
    //         let x = 0;
    //         if(bounding.xMin <= minPos.x){
    //             x = minPos.x + bounding.width*0.5;
    //         }
    //         if(bounding.xMax >= maxPos.x){
    //             x = maxPos.x - bounding.width*0.5;
    //         }

    //         target.position.set(x,target.position.y,target.position.z)
    //     }
    // }

    //public limitObject(node: Node){
    //     this._limitObject = node;
    //     this.targetParentUITransform = node.parent.getComponent(UITransform);
    //     this.targetUITransform = node.getComponent(UITransform);
    // }

    //public cancelLimitObject(){
    //     this._limitObject = null;
    //     this.targetUITransform = null;
    //     this.targetParentUITransform = null;
    // }
}

tnt.CameraController = CameraController;