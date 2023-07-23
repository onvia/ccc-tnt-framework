
import { _decorator, Component, Node, Material, Vec2, EffectAsset, v2, UITransform, RenderTexture, view, Rect, Layers, game, SpriteFrame, sys, Sprite, ImageAsset, Texture2D, size, Size, Canvas, director, find, Layout, Director } from 'cc';
const { ccclass, property } = _decorator;


declare global {

    interface ITNT {
        DualBlurEffect: typeof DualBlurEffect;
    }

    namespace tnt {
        type DualBlurEffect = InstanceType<typeof DualBlurEffect>;
    }
}

@ccclass('DualBlurEffect')
export class DualBlurEffect extends Component {
  
    @property(EffectAsset)
    effectAsset: EffectAsset = null;

    materialUp: Material = null;
    materialDown: Material = null;
    renderTexturePool: tnt.Pool<RenderTexture> = null;
    start () {
        if(!this.effectAsset){
            this.effectAsset = EffectAsset.get("../a-framework/resources/shader/effect/2d_dual_kawase_blur");
        }
        this.materialDown = new Material();
        this.materialDown.initialize({
            technique: 0,
            effectAsset: this.effectAsset,
            defines: [{USE_TEXTURE: true},{USE_PIXEL_ALIGNMENT: true,}]
        });

        this.materialUp = new Material();
        this.materialUp.initialize({
            technique: 1,
            effectAsset: this.effectAsset,
            defines: [{USE_TEXTURE: true},{USE_PIXEL_ALIGNMENT: true,}]
        });
        
        this.renderTexturePool = new tnt.Pool<RenderTexture>({
            maxCount: 8,
            newObject() {
                return new RenderTexture();
            },
        });
    }

    captureScreen(offset: number, iteration: number){
        const {width,height} = view.getVisibleSize();
        // this.cache.length = 0;
      
        let _buffer = this.blur(offset,iteration,1);
        
        const tempNode = new Node();
        tempNode.layer = Layers.Enum.UI_2D;
        const tempSprite = tempNode.addComponent(Sprite);
        tempSprite.sizeMode = Sprite.SizeMode.RAW;
      
        let img = new ImageAsset();
        img.reset({
            _data: _buffer,
            width: width,
            height: height,
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
        tempSprite.spriteFrame  = sf;

        tempNode.parent = director.getScene().getComponentInChildren(Canvas).node;

        // this.cache.forEach((node)=>{
        //     node.active = true;
        // });
        return tempNode;
    }
    
    blur(offset: number, iteration: number, scale: number = 1){
        
        const {width,height} = view.getVisibleSize();
        this.materialDown.setProperty('resolution', v2(width, height));
        this.materialDown.setProperty('offset', offset);
        this.materialUp.setProperty('resolution', v2(width, height));
        this.materialUp.setProperty('offset', offset);

        // 创建临时 RenderTexture
        let srcRT = this.renderTexturePool.get();
        let lastRT = this.renderTexturePool.get();
        this.getRenderTexture(lastRT);

        // // 记录升降纹理时纹理尺寸
        let pyramid: [number, number][] = [], tw: number = lastRT.width, th: number = lastRT.height;
        //Down Sample
        for (let i = 0; i < iteration; i++) {
            pyramid.push([tw, th]);
            [lastRT, srcRT] = [srcRT, lastRT];
            // 缩小截图尺寸，提高效率
            // 缩小尺寸时，RT会自动向下取整，导致黑边
            tw = Math.max(tw * scale, 1), th = Math.max(th * scale, 1);
            this.renderWithMaterial(srcRT, lastRT, this.materialDown, size(tw, th));
        }
        // Up Sample
        for (let i = iteration - 1; i >= 0; i--) {
            [lastRT, srcRT] = [srcRT, lastRT];
            this.renderWithMaterial(srcRT, lastRT, this.materialUp, size(pyramid[i][0], pyramid[i][1]));
        }

        let _buffer = lastRT.readPixels(0,0,width, height);

        this.renderTexturePool.put(srcRT);
        this.renderTexturePool.put(lastRT);
       
        return _buffer;
    }

    getRenderTexture(out: RenderTexture){
        let camera = tnt.captureMgr.getCaptureCamera("BLUR_CAPTURE_CAMERA");
        camera.node.active = true;
        if(!out){
            out = this.renderTexturePool.get();
        }
        const {width,height} = view.getVisibleSize();
        // 防止重复重置
        if(out.width != width || out.height != height){
            out.reset({width, height});
        }
        camera.targetTexture = out;
        let zoomRatio =  height / height / 1;
        camera.orthoHeight = height * 0.5 / zoomRatio;

        camera.visibility = Layers.Enum.UI_2D;
        // game.step();
        director.emit(Director.EVENT_AFTER_UPDATE);
        director.root.frameMove(0);
        camera.targetTexture = null;     
        camera.node.active = false;
        return out;
    }

    renderWithMaterial(srcRT: RenderTexture, dstRT: RenderTexture | Material, material?: Material, size?: Size){
        // 检查参数
        if (dstRT instanceof Material) {
            material = dstRT;
            dstRT = new RenderTexture();
        }

        // 获取图像宽高
        const { width, height } = size ?? { width: srcRT.width, height: srcRT.height };
        
        if(dstRT.width != width || dstRT.height != height){
            dstRT.reset({width, height});
        }
        // dstRT.reset({width: width*0.5, height: height*0.5});     
        const {width: winWidth,height: winHeight} = view.getVisibleSize();


        const tempNode =  new Node();
        tempNode.name = "CaptureNode";
        tempNode.addComponent(Sprite);
        tempNode.layer = tnt.captureMgr.CAPTURE_LAYER;
        tempNode.parent = director.getScene().getComponentInChildren(Canvas).node;
        const tempSprite = tempNode.getComponent(Sprite);
        tempSprite.sizeMode = Sprite.SizeMode.RAW;
        tempSprite.trim = false;
        let spriteFrame = new SpriteFrame();
        spriteFrame.texture = srcRT;
        spriteFrame.flipUVY = true;
        tempSprite.spriteFrame = spriteFrame;
        tempSprite.customMaterial = material;

        
        let camera = tnt.captureMgr.getCaptureCamera("BLUR_CAPTURE_CAMERA");
        let zoomRatio =  winHeight / srcRT.height;
        camera.orthoHeight = winHeight * 0.5 / zoomRatio;
        // console.log(`DualBlurEffect-> zoomRatio: ${zoomRatio},orthoHeight: ${camera.orthoHeight}`);
        camera.visibility = tnt.captureMgr.CAPTURE_LAYER;
        camera.targetTexture = dstRT;
        camera.node.active = true;

        // 更新一下 脏数据，否则无法渲染
        tempSprite.updateRenderer();
        // game.step();
        director.emit(Director.EVENT_AFTER_UPDATE);
        director.root.frameMove(0);
        
        camera.node.active = false;

        // this.debug(dstRT.readPixels(),width,height);
        // this.debug2(dstRT);
        camera.targetTexture = null;
        tempNode.destroy();
        tempSprite.spriteFrame.destroy();
        tempSprite.destroy();
        return dstRT;
    }

    // private cache: Node[] = [];

    // private debug(_buffer,width,height){

    //     const tempNode = new Node();
    //     tempNode.layer = Layers.Enum.UI_2D;
    //     const tempSprite = tempNode.addComponent(Sprite);
    //     tempSprite.sizeMode = Sprite.SizeMode.RAW;
      
    //     let img = new ImageAsset();
    //     img.reset({
    //         _data: _buffer,
    //         width: width,
    //         height: height,
    //         format: Texture2D.PixelFormat.RGBA8888,
    //         _compressed: false
    //     });
    //     let texture = new Texture2D();
    //     texture.image = img;
    //     let sf = new SpriteFrame();
    //     sf.texture = texture;
    //     sf.packable = false;
    //     sf.flipUVY = true;
    //     if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
    //         sf.flipUVY = false;
    //     }
    //     tempSprite.spriteFrame  = sf;

    //     tempNode.parent = director.getScene().getComponentInChildren(Canvas).node;

    //     this.cache.push(tempNode);
    //     tempNode.active = false;
    // }
    // private debug2(rt){
    //     const tempNode = new Node();
    //     tempNode.layer = Layers.Enum.UI_2D;
    //     const tempSprite = tempNode.addComponent(Sprite);
    //     tempSprite.sizeMode = Sprite.SizeMode.RAW;
      
    
    //     let sf = new SpriteFrame();
    //     sf.texture = rt;
    //     sf.packable = false;
    //     sf.flipUVY = true;
    //     if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
    //         sf.flipUVY = false;
    //     }
    //     tempSprite.spriteFrame  = sf;

    //     tempNode.parent = director.getScene().getComponentInChildren(Canvas).node;

    //     this.cache.push(tempNode);
    //     tempNode.active = false;
    // }
}

tnt.DualBlurEffect = DualBlurEffect;