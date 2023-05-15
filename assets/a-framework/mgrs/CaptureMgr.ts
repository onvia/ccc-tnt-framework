
import { _decorator, Component, Node, find, Camera, Layers, view, Color, Sprite, SpriteFrame, ImageAsset, Texture2D, Rect, UITransform, Size, sys, instantiate, director, isValid, Director, UIRenderer, RenderTexture } from 'cc';
const { ccclass, property } = _decorator;



declare global {
    interface ITNT {
        captureMgr: CaptureMgr;

    }
}

let pool = new tnt.Pool<Node>({
    maxCount: 8,
    newObject() {
        let node = new Node();
        node.name = "CaptureNode";
        node.addComponent(Sprite);
        node.layer = Layers.Enum.UI_2D;
        return node;
    },
    reset(node: Node) {
        if (!node || !isValid(node)) {
            return false;
        }
        node.name = "CaptureNode";
        let sprite = node.getComponent(Sprite);
        sprite.spriteFrame?.texture?.destroy();  // 这里会把 renderTexture 销毁
        sprite.spriteFrame?.destroy();
        sprite.spriteFrame = null;
        node.removeFromParent();
        return true;
    }
});

@ccclass('CaptureMgr')
class CaptureMgr {

    private _captureLayer: number = -1;
    public get CAPTURE_LAYER(): number {
        if (this._captureLayer != -1) {
            return 1 << this._captureLayer;
        }

        // 跳过 索引 0
        for (let i = 1; i < 19; i++) {
            let name = Layers.layerToName(i);
            if (name === "CAPTURE_LAYER") {
                this._captureLayer = i;
                break;
            }
            if (typeof name === 'undefined') {
                this._captureLayer = i;
                Layers.addLayer("CAPTURE_LAYER", this._captureLayer);
                break;
            }
        }

        if (this._captureLayer === -1) {
            throw new Error("无法增加新图层");
        }

        return (1 << this._captureLayer);
    }

    get captureCamera() {
        return this.getCaptureCamera();
    }

    getCaptureCamera(name = null) {
        name = name ?? "DEFAULT_CAPTURE_CAMERA";
        let cameraNode: Node = find("Canvas/" + name);
        let camera: Camera = null;
        if (cameraNode) {
            camera = cameraNode.getComponent(Camera);
        } else {
            cameraNode = new Node();
            camera = cameraNode.addComponent(Camera);
            cameraNode.parent = find("Canvas");
        }


        camera.projection = Camera.ProjectionType.ORTHO;
        camera.clearFlags = Camera.ClearFlag.DEPTH_ONLY;
        camera.clearColor = Color.BLACK;
        camera.clearDepth = 1;
        camera.clearStencil = 0;

        camera.node.setPosition(0, 0, 1000);
        let size = view.getVisibleSize();
        camera.orthoHeight = size.height * 0.5;


        camera.visibility = Layers.Enum.UI_2D;
        cameraNode.setSiblingIndex(999);

        cameraNode.layer = Layers.Enum.DEFAULT;
        cameraNode.name = name;

        cameraNode.active = false;
        return camera;
    }

    private createCopyNode(node: Node): [Node, Rect] {
        let trans = node.getComponent(UITransform);
        var width = trans.width;
        var height = trans.height;
        var worldPos = node.getWorldPosition();
        let rect = new Rect(Math.ceil(worldPos.x - width * trans.anchorX), Math.ceil(worldPos.y - height * trans.anchorY), width, height);

        // 拷贝一个 节点出来专门用作截图
        let copyNode = instantiate(node);
        copyNode.active = true;
        // 设置为截图图层
        copyNode.layer = this.CAPTURE_LAYER;
        copyNode.parent = node.parent;

        return [copyNode, rect];
    }


    /**
     * 异步截取单个节点
     *
     * @param {Node} node
     * @param {Runnable1<Node>} [callback]
     * @param {Camera} [camera]
     * @return {*} 
     * @memberof CaptureMgr
     */
    captureNodeAsync(node: Node, callback?: Runnable1<Node>, camera?: Camera) {

        let [copyNode, rect] = this.createCopyNode(node);

        let render = copyNode.getComponent(UIRenderer);
        // 更新一下 脏数据，否则无法渲染
        render.updateRenderer();
        director.emit(Director.EVENT_AFTER_UPDATE);
        return this.captureScreenAsync(rect, {
            layer: this.CAPTURE_LAYER,
            camera: camera,
            callback: (node) => {
                // 截图完成销毁 拷贝出来的节点
                copyNode.destroy();
                callback?.(node);
            }
        });
    }

    /**
     * 同步截取单个节点
     * 
     * @param {Node} node
     * @return {*} 
     * @memberof CaptureMgr
     */
    captureNodeSync(node: Node, camera?: Camera) {
        let [copyNode, rect] = this.createCopyNode(node);
        let render = copyNode.getComponent(UIRenderer);
        // 更新一下 脏数据，否则无法渲染
        render.updateRenderer();
        let captureNode = this.captureScreenSync(rect, { layer: this.CAPTURE_LAYER, camera: camera });
        copyNode.destroy();
        return captureNode;
    }



    /**
     * 异步截取屏幕
     *
     * @param {Rect} [rect]
     * @param {{ layer?: Layers.Enum,callback?: Runnable1<Node> }} [options]
     * @return {*} 
     * @memberof CaptureMgr
     */
    captureScreenAsync(rect?: Rect, options?: { layer?: Layers.Enum, callback?: Runnable1<Node>, camera?: Camera }) {
        let camera = options?.camera;
        if (!camera) {
            camera = this.getCaptureCamera();
        }
        camera.node.active = true;
        let rt = new RenderTexture();
        const { width, height } = view.getVisibleSize();
        if (!rect) {
            rect = new Rect(0, 0, width, height)
        }

        //  防止重复重置
        if (rt.width != width || rt.height != height) {
            rt.reset({ width, height });
        }


        camera.targetTexture = rt;
        let node = pool.get();
        node.layer = Layers.Enum.UI_2D;

        // 摄像机设置为 只显示截图图层
        if (options?.layer) {
            camera.visibility = options.layer;
        }

        // // 下一帧才有数据
        let sprite = node.getComponent(Sprite);
        director.once(Director.EVENT_AFTER_DRAW, () => {
            let _buffer = rt.readPixels(rect.x, rect.y, rect.width, rect.height);
            let img = new ImageAsset();
            img.reset({
                _data: _buffer,
                width: rect.width,
                height: rect.height,
                format: Texture2D.PixelFormat.RGBA8888,
                _compressed: false
            });
            let texture = new Texture2D();
            texture.image = img;
            let sf = new SpriteFrame();
            sf.texture = texture;
            sf.packable = false;
            sf.flipUVY = true;
            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                sf.flipUVY = false;
            }
            sprite.spriteFrame = sf;
            camera.node.active = false;
            node.getComponent(UITransform)?.setContentSize(rect.size);
            // // 截图完成回收 rt
            // tnt.renderTextureMgr.recycle(rt);
            rt.destroy();

            options?.callback?.(node);
        });
        return node;
    }
    /**
     * 同步截取屏幕
     *
     * @param {Camera} camera
     * @param {Rect} [rect]
     * @param {{ layer?: Layers.Enum }} [options]
     * @return {*} 
     * @memberof CaptureMgr
     */
    captureScreenSync(rect?: Rect, options?: { layer?: Layers.Enum, camera?: Camera }) {
        let camera = options?.camera;
        if (!camera) {
            camera = this.getCaptureCamera();
            camera.node.active = true;
        }
        let rt = new RenderTexture();
        const { width, height } = view.getVisibleSize();

        if (!rect) {
            rect = new Rect(0, 0, width, height)
        }
        // //  防止重复重置
        if (rt.width != width || rt.height != height) {
            rt.reset({ width, height });
        }

        let node = pool.get();
        node.layer = Layers.Enum.UI_2D;
        camera.targetTexture = rt;

        // 摄像机设置为 只显示截图图层
        if (options?.layer) {
            camera.visibility = options.layer;
        } else {
            camera.visibility = Layers.Enum.UI_2D;
        }

        // game.step();
        // director.emit(Director.EVENT_AFTER_UPDATE);
        director.root.frameMove(0);
        let _buffer = rt.readPixels(rect.x, rect.y, rect.width, rect.height);
        let sprite = node.getComponent(Sprite);
        let img = new ImageAsset();
        img.reset({
            _data: _buffer,
            width: rect.width,
            height: rect.height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });
        let texture = new Texture2D();
        texture.image = img;
        let sf = new SpriteFrame();
        sf.texture = texture;
        sf.packable = false;
        sf.flipUVY = true;
        if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
            sf.flipUVY = false;
        }
        sprite.spriteFrame = sf;
        camera.node.active = false;

        let trans = node.getComponent(UITransform);
        trans.width = rect.width;
        trans.height = rect.height;
        
        // tnt.renderTextureMgr.recycle(rt);
        rt.destroy();

        return node;
    }


    /** 获取一个截图显示专用节点 */
    allocCaptureNode() {
        return pool.get();
    }

    /**
     * 回收截图节点
     *
     * @param {Node} node
     * @memberof CaptureMgr
     */
    recycleCaptureNode(node: Node) {
        pool.put(node);
    }


    private static _instance: CaptureMgr = null
    public static getInstance(): CaptureMgr {
        if (!this._instance) {
            this._instance = new CaptureMgr();
        }
        return this._instance;
    }
}

tnt.captureMgr = CaptureMgr.getInstance();
export { };