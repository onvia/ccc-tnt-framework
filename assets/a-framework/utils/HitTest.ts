import { _decorator, Component, Node, __private, gfx, SpriteFrame, Mat4, math, UITransform, Vec2, Vec3, Sprite } from 'cc';
const { ccclass, property } = _decorator;
const _mat4_temp = new Mat4();
const _worldMatrix = new Mat4();
const _zeroMatrix = new Mat4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
const testPt = new Vec2();
const v2WorldPt = new Vec2();
const v3WorldPt = new Vec3();


declare global {
    interface ITNT {
        hitTest: HitTest;
    }
}


@ccclass('HitTest')
class HitTest {
    private textureBufferMap: WeakMap<__private._cocos_asset_assets_texture_base__TextureBase, Uint8Array> = new WeakMap();
    // private spriteFrameBufferMap: WeakMap<SpriteFrame, Uint8Array> = new WeakMap();
    private spriteBufferMap: WeakMap<Sprite, Uint8Array> = new WeakMap();
    private nodeHitTestFnMap: WeakMap<UITransform, (screenPoint: Vec2, windowId?: number) => boolean> = new WeakMap();

    enablePixelHitTest(uiTransform: UITransform, enable: boolean = true) {
        if (!uiTransform) {
            return;
        }
        if (!enable) {
            let fn = this.nodeHitTestFnMap.get(uiTransform);
            if (fn) {
                uiTransform.hitTest = fn.bind(uiTransform);
            }
            return;
        }
        let node = uiTransform.node;


        let oldHitTest = uiTransform.hitTest;
        this.nodeHitTestFnMap.set(uiTransform, oldHitTest);
        uiTransform.hitTest = (screenPoint: math.Vec2, windowId: number = 0) => {
            let hit = oldHitTest.call(uiTransform, screenPoint, windowId);

            if (!hit) {
                return false;
            }
            let w = uiTransform.contentSize.width;
            let h = uiTransform.contentSize.height;

            // let pixelData = this.readPixelsFromSprite(node.sprite);
            // if (!pixelData) {
            //     return false;
            // }
            let scene = uiTransform._sceneGetter?.() ?? node.scene.renderScene;
            for (let i = 0; i < scene.cameras.length; i++) {
                const camera = scene.cameras[i];
                if (!(camera.visibility & node.layer) || (camera.window && !camera.window.swapchain)) { continue; }
                if (camera.systemWindowId !== windowId) {
                    continue;
                }
                Vec3.set(v3WorldPt, screenPoint.x, screenPoint.y, 0);  // vec3 screen pos
                camera.screenToWorld(v3WorldPt, v3WorldPt);
                Vec2.set(v2WorldPt, v3WorldPt.x, v3WorldPt.y);

                // Convert World Space into Local Node Space.
                uiTransform.node.getWorldMatrix(_worldMatrix);
                Mat4.invert(_mat4_temp, _worldMatrix);
                if (Mat4.strictEquals(_mat4_temp, _zeroMatrix)) {
                    continue;
                }
                Vec2.transformMat4(testPt, v2WorldPt, _mat4_temp);
                // testPt.x += uiTransform.anchorPoint.x * w;
                // testPt.y += uiTransform.anchorPoint.y * h;
                // let pixelIndex = (Math.floor(testPt.y) * w + Math.floor(testPt.x)) * 4; // 4表示每个像素的RGBA分量

                // //     // // 获取像素数据
                // //     // let red = pixelData[pixelIndex];
                // //     // let green = pixelData[pixelIndex + 1];
                // //     // let blue = pixelData[pixelIndex + 2];
                // let alpha = pixelData[pixelIndex + 3];

                // if (alpha > 0) {
                //     // 用户点击了不透明的像素
                //     return true;
                // }

                let pixel = this._getPixels(testPt, node.sprite);

                if (pixel.a > 0) {
                    // 用户点击了不透明的像素
                    return true;
                }

                // if(this.checkPixel(testPt,node.sprite)){
                //     return true;
                // }
            }

            // return true;
            return false;
        }
    }

    /**
     * 读取渲染纹理像素信息
     * @param texture 
     * @param flipY 是否翻转Y轴，默认true
     */
    public readPixels(texture: __private._cocos_asset_assets_texture_base__TextureBase, flipY: boolean = true): Uint8Array {
        if (!texture) {
            return null;
        }
        if (this.textureBufferMap.has(texture)) {
            return this.textureBufferMap.get(texture);
        }

        // 通用版本
        var { width, height } = texture, gfxTexture = texture.getGFXTexture(), gfxDevice = texture['_getGFXDevice'](), bufferViews = [],
            region = new gfx.BufferTextureCopy(), buffer = new Uint8Array(width * height * 4);
        // region.texOffset.x = region.texOffset.y = 0;
        region.texExtent.width = width;
        region.texExtent.height = height;
        bufferViews.push(buffer);
        gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, [region]);
        // 翻转
        if (flipY) {
            let i = 0, len1 = height / 2, len2 = width * 4, j: number, idx0: number, idx1: number;
            while (i < len1) {
                j = 0;
                while (j < len2) {
                    idx0 = i * len2 + j;
                    idx1 = (height - i - 1) * len2 + j++;
                    [buffer[idx0], buffer[idx1]] = [buffer[idx1], buffer[idx0]];
                }
                i++;
            }
        }

        this.textureBufferMap.set(texture, buffer);
        return buffer;
    }

    // /**
    //  * 读取渲染纹理像素信息
    //  * @param spriteFrame 
    //  * @param flipY 是否翻转Y轴，默认true
    //  */
    // public readPixelsFromSprite(sprite: Sprite, flipY: boolean = true): Uint8Array {
    //     if (!sprite) {
    //         return null;
    //     }
    //     let spriteFrame = sprite.spriteFrame;
    //     if (this.spriteFrameBufferMap.has(spriteFrame)) {
    //         return this.spriteFrameBufferMap.get(spriteFrame);
    //     }
    //     if (spriteFrame.packable) {

    //         let isRaw = !sprite.trim && sprite.sizeMode === Sprite.SizeMode.RAW;
    //         let buffer = this.readPixels(spriteFrame.original._texture, isRaw ? flipY : false);
    //         let clipBuffer = isRaw ? buffer : this.clipTransparentPixels(buffer, spriteFrame, flipY);

    //         return clipBuffer;

    //         let atlasPixelData = this.readPixels(spriteFrame.texture, false);
    //         let atlasWidth = spriteFrame.texture.width;
    //         let atlasHeight = spriteFrame.texture.height;
    //         let rect = spriteFrame.rect;
    //         // 计算要提取的纹理在Uint8Array中的起始位置
    //         let startX = Math.floor(rect.x);
    //         let startY = Math.floor(rect.y);

    //         // 计算提取纹理的宽度和高度
    //         let textureWidth = rect.width;
    //         let textureHeight = rect.height;


    //         // 创建一个新的 Uint8Array 来存储提取的纹理像素数据
    //         let extractedTextureData = new Uint8Array(textureWidth * textureHeight * 4); // 4表示RGBA分量

    //         // 从 atlasPixelData 中复制提取的像素数据到 extractedTextureData
    //         for (let y = 0; y < textureHeight; y++) {
    //             // 如果需要进行Y轴翻转，可以调整行的顺序
    //             let sourceY = flipY !== false ? (textureHeight - y - 1) : y;

    //             for (let x = 0; x < textureWidth; x++) {
    //                 // 计算在 atlasPixelData 中的索引
    //                 let atlasIndex = ((startY + sourceY) * atlasWidth + (startX + x)) * 4;

    //                 // 计算在 extractedTextureData 中的索引
    //                 let extractedIndex = (y * textureWidth + x) * 4;

    //                 // 复制像素数据
    //                 for (let component = 0; component < 4; component++) {
    //                     extractedTextureData[extractedIndex + component] = atlasPixelData[atlasIndex + component];
    //                 }
    //             }
    //         }
    //         this.spriteFrameBufferMap.set(spriteFrame, extractedTextureData);
    //         return extractedTextureData;
    //     }


    //     return this.readPixels(spriteFrame.texture, flipY);
    // }

    // clipTransparentPixels(pixelData: Uint8Array, spriteFrame: SpriteFrame, flipY: boolean = true) {
    //     let minX = spriteFrame.original._x;
    //     let minY = spriteFrame.original._y;
    //     let maxX = minX + spriteFrame.rect.width;
    //     let maxY = minY + spriteFrame.rect.height;

    //     let newWidth = spriteFrame.rect.width;
    //     let newHeight = spriteFrame.rect.height;

    //     // 创建新的Uint8Array
    //     let clippedPixelData = new Uint8Array(newWidth * newHeight * 4);
    //     // 复制像素数据
    //     for (let y = minY; y <= maxY; y++) {
    //         for (let x = minX; x <= maxX; x++) {
    //             let sourceIndex = (y * spriteFrame.originalSize.width + x) * 4;
    //             let destIndex;
    //             if (flipY) {
    //                 destIndex = ((maxY - y) * newWidth + (x - minX)) * 4;
    //             } else {
    //                 destIndex = ((y - minY) * newWidth + (x - minX)) * 4;
    //             }

    //             clippedPixelData[destIndex] = pixelData[sourceIndex];     // R通道
    //             clippedPixelData[destIndex + 1] = pixelData[sourceIndex + 1]; // G通道
    //             clippedPixelData[destIndex + 2] = pixelData[sourceIndex + 2]; // B通道
    //             clippedPixelData[destIndex + 3] = pixelData[sourceIndex + 3]; // A通道
    //         }
    //     }
    //     return clippedPixelData;
    // }


    readPixelsFromSprite(sprite: Sprite) {
        let buffer: Uint8Array = null;
        if (this.spriteBufferMap.has(sprite)) {
            buffer = this.spriteBufferMap.get(sprite);
        } else {

            let spriteFrame = sprite.spriteFrame;
            let texture = spriteFrame.texture;
            let tx = spriteFrame.rect.x;
            let ty = spriteFrame.rect.y;
            if (spriteFrame.packable) {
                texture = spriteFrame.original._texture;
                tx = spriteFrame.original._x;
                ty = spriteFrame.original._y;
            }
            let width = spriteFrame.rect.width;
            let height = spriteFrame.rect.height;

            let gfxTexture = texture.getGFXTexture();
            let gfxDevice = texture['_getGFXDevice']();
            let bufferViews = [];
            let region = new gfx.BufferTextureCopy()
            buffer = new Uint8Array(width * height * 4);
            region.texOffset.x = tx, region.texOffset.y = ty;
            region.texExtent.width = width;
            region.texExtent.height = height;
            bufferViews.push(buffer);
            gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, [region]);
            this.spriteBufferMap.set(sprite, buffer);
        }

        return buffer;
    }

    public getPixels(worldPosition: Vec2, sprite: Sprite) {
        sprite.node.uiTransform.convertToNodeSpaceAR(worldPosition.copyAsVec3(), v3WorldPt);
        Vec2.set(v2WorldPt, v3WorldPt.x, v3WorldPt.y);
        return this._getPixels(v2WorldPt, sprite);
    }

    private _getPixels(position: Vec2, sprite: Sprite) {
        let spriteFrame = sprite.spriteFrame;
        let buffer = this.readPixelsFromSprite(sprite);

        const texWidth = spriteFrame.rect.width;
        const texHeight = spriteFrame.rect.height;
        const originSize = spriteFrame.originalSize;
        const uiTrans = sprite.node.uiTransform;

        const anchorX = uiTrans.anchorX;
        const anchorY = uiTrans.anchorY;

        const contentWidth = uiTrans.width;
        const contentHeight = uiTrans.height;

        let pixels = { r: 0, g: 0, b: 0, a: 0 };
        let index = -1;

        if (sprite.trim) {
            let x = Math.floor(position.x / (contentWidth / texWidth) + texWidth * anchorX);
            let y = Math.floor(texHeight - (position.y / (contentHeight / texHeight) + texHeight * anchorY));
            index = (y * texWidth + x) * 4;
        } else {
            let scaleX = contentWidth / originSize.width; // 计算原始图像与节点大小的缩放系数
            let scaleY = contentHeight / originSize.height;

            let leftPoint = position.x + contentWidth * anchorX; // 转换到左上角坐标
            let topPoint = Math.abs(position.y + contentHeight * (anchorY - 1));

            let tx = spriteFrame.rect.x;
            let ty = spriteFrame.rect.y;
            if (spriteFrame.packable) {
                tx = spriteFrame.original._x;
                ty = spriteFrame.original._y;
            }
            // 计算鼠标在图像像素上的位置
            let x = Math.floor((leftPoint - tx * scaleX) / scaleX);
            let y = Math.floor((topPoint - ty * scaleY) / scaleY);
            index = (y * texWidth + x) * 4;
        }

        if (index > -1) {
            pixels.r = buffer[index + 0];
            pixels.g = buffer[index + 1];
            pixels.b = buffer[index + 2];
            pixels.a = buffer[index + 3];
        }        
        return pixels;
    }

}

tnt.hitTest = new HitTest();

export { };