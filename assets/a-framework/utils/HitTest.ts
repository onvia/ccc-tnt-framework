import { _decorator, Component, Node, __private, gfx, SpriteFrame, Mat4, math, UITransform, Vec2, Vec3, Sprite, js, sys } from 'cc';
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

        this.enableSpriteFrameListener(node.sprite);
        let oldHitTest = uiTransform.hitTest;
        this.nodeHitTestFnMap.set(uiTransform, oldHitTest);
        uiTransform.hitTest = (screenPoint: math.Vec2, windowId: number = 0) => {
            let hit = oldHitTest.call(uiTransform, screenPoint, windowId);

            if (!hit) {
                return false;
            }

            if (!node.sprite) {
                return hit;
            }

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

                let checked = this._checkPixels(testPt, node.sprite);

                if (checked) {
                    // 用户点击了不透明的像素
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * 监听 spriteFrame 变化，删除缓存的像素数据
     *
     * @private
     * @param {Sprite} sprite
     * @return {*} 
     * @memberof HitTest
     */
    private enableSpriteFrameListener(sprite: Sprite) {
        if (!sprite) {
            return;
        }
        let _property = "spriteFrame";
        let desc = js.getPropertyDescriptor(sprite, _property);
        if (!!desc.set) {
            Object.defineProperty(sprite, _property, {
                get: desc.get,
                set: (value) => {
                    if (sprite.spriteFrame != value) {
                        this.spriteBufferMap.delete(sprite);
                    }
                    desc.set.call(sprite, value);
                }
            });
            return;
        }
    }

    public readPixelsFromSprite(sprite: Sprite) {
        let buffer: Uint8Array = null;
        if (this.spriteBufferMap.has(sprite)) {
            buffer = this.spriteBufferMap.get(sprite);
        }

        if (!buffer) {
            let spriteFrame = sprite.spriteFrame;
            let texture = spriteFrame.texture;
            let tx = spriteFrame.rect.x;
            let ty = spriteFrame.rect.y;
            if (spriteFrame.packable && spriteFrame.original) {
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

    private _checkPixels(position: Vec2, sprite: Sprite) {
        let buffer = this.readPixelsFromSprite(sprite);
        let index = this._getBufferIndex(position, sprite);
        return buffer[index + 3] > 0;
    }

    private _getBufferIndex(position: Vec2, sprite: Sprite) {

        let spriteFrame = sprite.spriteFrame;
        const texWidth = spriteFrame.rect.width;
        const texHeight = spriteFrame.rect.height;
        const originSize = spriteFrame.originalSize;
        const uiTrans = sprite.node.uiTransform;

        const anchorX = uiTrans.anchorX;
        const anchorY = uiTrans.anchorY;

        const contentWidth = uiTrans.width;
        const contentHeight = uiTrans.height;

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
            if (spriteFrame.packable && spriteFrame.original) {
                tx = spriteFrame.original._x;
                ty = spriteFrame.original._y;
            }
            // 计算鼠标在图像像素上的位置
            let x = Math.floor((leftPoint - tx * scaleX) / scaleX);
            let y = Math.floor((topPoint - ty * scaleY) / scaleY);
            index = (y * texWidth + x) * 4;
        }

        return index;
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
            let buffer = this.textureBufferMap.get(texture);
            if (buffer) {
                return buffer;
            }
        }

        // 通用版本
        let { width, height } = texture, gfxTexture = texture.getGFXTexture(), gfxDevice = texture['_getGFXDevice'](), bufferViews = [],
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
}

tnt.hitTest = new HitTest();

export { };