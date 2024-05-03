
import { EPSILON, Node, RenderData, StencilManager, UIRenderer, approx, cclegacy, clamp, gfx, log, sp, __private } from "cc";
import { JSB } from 'cc/env';

declare module 'cc' {
    interface UI {

        /**
         * 渲染器缓存
         */
        rendererCache: UIRenderer[];

        /**
         * 渲染器排序
         */
        rendererOrder: boolean;

        /**
         * 刷新渲染缓存
         */
        flushRendererCache();
    }
}

enum Stage {
    // Stencil disabled
    DISABLED = 0,
    // Clear stencil buffer
    CLEAR = 1,
    // Entering a new level, should handle new stencil
    ENTER_LEVEL = 2,
    // In content
    ENABLED = 3,
    // Exiting a level, should restore old stencil or disable
    EXIT_LEVEL = 4,
    // Clear stencil buffer & USE INVERTED
    CLEAR_INVERTED = 5,
    // Entering a new level & USE INVERTED
    ENTER_LEVEL_INVERTED = 6,
};

function binarySearchInsert<T>(arr: T[], item: T, keyMapper?: (item: T) => any, unique: boolean = false): number {
    let low = 0, high = arr.length - 1;
    let mid = NaN;
    let itemValue = keyMapper ? keyMapper(item) : item;
    while (low <= high) {
        mid = ((high + low) / 2) | 0;
        let midValue = keyMapper ? keyMapper(arr[mid]) : arr[mid];
        if (itemValue === midValue) {
            if (unique) {
                return mid;
            } else {
                break;
            }
        } else if (itemValue > midValue) {
            low = mid + 1;
        } else if (itemValue < midValue) {
            high = mid - 1;
        }
    }
    let index = low > mid ? mid + 1 : mid;
    arr.splice(index, 0, item);
    return index;
}

const Batcher2D = cclegacy[`internal`][`Batcher2D`];
let batcher2dPrototype = Batcher2D.prototype;
let oldBatcher2DUpdate = Batcher2D.prototype.update;
let oldBatcher2DWalk = Batcher2D.prototype.walk;
export function enableChangeBatcher2D() {
   
}


if (!batcher2dPrototype["_$pro$_"]) {
    batcher2dPrototype["_$pro$_"] = true;
    let __renderQueue: Node[][] = [];
    const levelSplit = (node: Node, lv: number, itemIndex) => {
        if (!__renderQueue[lv]) {
            __renderQueue[lv] = [];
        }
        __renderQueue[lv].push(node);
        lv++;
        node["__renderLv"] = lv;
        node["__levelRender"] = true;
        node["__itemIndex"] = itemIndex;
        const cs = node.children;
        for (let i = 0; i < cs.length; ++i) {
            const c = cs[i];
            if (!__renderQueue[lv]) {
                __renderQueue[lv] = [];
            }
            lv = levelSplit(c, lv, itemIndex);
        }
        return lv;
    }

    Object.defineProperty(batcher2dPrototype, "manualSplit", {
        value: function (node: Node, opacity: number, lv: number, sortingPriority = 0) {

            node["__levelRender"] = true;
            const uiProps = node._uiProps;
            const render = uiProps.uiComp as UIRenderer;
            const transform = uiProps.uiTransformComp;
            sortingPriority = (transform && transform._sortingEnabled) ? transform._sortingPriority : (sortingPriority + lv);
            if (render) {

                render.renderPriority = sortingPriority;
                // this.rendererCache.push(render);

                // binarySearchInsert(this.rendererCache, render, (item: UIRenderer) => item?.renderPriority);
                // if (sortingPriority != 0) {
                //     this.rendererOrder = true;
                // }
                if (this._opacityDirty && render && !render.useVertexOpacity && render.renderData && render.renderData.vertexCount > 0) {
                    render.renderOpacity = opacity;
                } else {
                    render.renderOpacity = -1;
                }
            }


            binarySearchInsert(this.rendererCache, node, (item: Node) => {
                const render = item._uiProps.uiComp as UIRenderer;
                return render?.renderPriority || 0;
            });

            const cs = node.children;
            for (let i = 0; i < cs.length; ++i) {
                const c = cs[i];
                this.manualSplit(c, opacity, i + 1, sortingPriority);
            }

        }
    });


    Object.defineProperty(batcher2dPrototype, "update", {
        value: function () {
            if (JSB) {
                return;
            }
            this.rendererCache = this.rendererCache ?? [];
            this.rendererOrder = false;
            const screens = this._screens;
            let offset = 0;
            for (let i = 0; i < screens.length; ++i) {
                const screen = screens[i];
                const scene = screen._getRenderScene();
                if (!screen.enabledInHierarchy || !scene) {
                    continue;
                }
                // Reset state and walk
                this._opacityDirty = 0;
                this._pOpacity = 1;

                this.walk(screen.node);

                this.autoMergeBatches(this._currComponent!);
                this.resetRenderStates();

                let batchPriority = 0;
                if (this._batches.length > offset) {
                    for (; offset < this._batches.length; ++offset) {
                        const batch = this._batches.array[offset];

                        if (batch.model) {
                            const subModels = batch.model.subModels;
                            for (let j = 0; j < subModels.length; j++) {
                                subModels[j].priority = batchPriority++;
                            }
                        } else {
                            batch.descriptorSet = this._descriptorSetCache.getDescriptorSet(batch);
                        }
                        scene.addBatch(batch);
                    }
                }
            }
        }
    })
    Object.defineProperty(batcher2dPrototype, "walk", {
        value: function (node: Node, level = 0, sortingPriority = 0, sortingLevel = 0) {
            if (!node[`activeInHierarchy`]) {
                return;
            }

            const children = node.children;
            const uiProps = node._uiProps;
            const render = uiProps.uiComp as UIRenderer;
            const stencilStage = render && render.stencilStage as unknown;
            const stencilEnterLevel = render && (stencilStage === Stage.ENTER_LEVEL || stencilStage === Stage.ENTER_LEVEL_INVERTED);
            // const transform = uiProps.uiTransformComp;

            // let sortingEnabled = transform?._sortingEnabled;
            // sortingPriority = sortingEnabled ? transform._sortingPriority : sortingPriority;
            // if ((transform && transform._sortingEnabled)) {
            //     ++sortingLevel;
            // }


            // Save opacity
            let parentOpacity = 1;
            if (node.parent && node.parent._uiProps) {
                parentOpacity = node.parent._uiProps.opacity;
            }
            let opacity = parentOpacity;
            // TODO Always cascade ui property's local opacity before remove it
            const selfOpacity = render && render.color ? render.color.a / 255 : 1;

            opacity *= selfOpacity * uiProps.localOpacity;
            // 当前
            if (render) {
                if (uiProps[`_opacity`] != opacity) {
                    render.renderOpacity = opacity;
                } else {
                    render.renderOpacity = -1;
                }
            }
            // TODO Set opacity to ui property's opacity before remove it
            if (uiProps[`setOpacity`]) {
                uiProps[`setOpacity`](opacity);
            } else {
                uiProps[`_opacity`] = opacity;
            }
            if (!approx(opacity, 0, EPSILON)) {
                if (uiProps.colorDirty) {
                    // Cascade color dirty state
                    this._opacityDirty++;
                }

                // Render assembler update logic
                if (render && render.enabledInHierarchy) {
                    render.fillBuffers(this);// for rendering
                }

                // Update cascaded opacity to vertex buffer
                if ((this._opacityDirty || render?.renderOpacity >= 0) && render && (!render.useVertexOpacity && render.renderData && render.renderData.vertexCount > 0)) {
                    // HARD COUPLING
                    updateOpacity(render.renderData, opacity);
                    const buffer = render.renderData.getMeshBuffer();
                    if (buffer) {
                        buffer.setDirty();
                    }
                }

                if (render && render.renderData && render.useVertexOpacity && render.renderData.vertexCount > 0 && opacity != 1) {
                    updateMiddlewareOpacity(render.renderData, opacity);
                }

                if (children.length > 0 && !node._static) {
                    if (!node[`__levelRender`]) {
                        __renderQueue = [];
                        for (let i = 0; i < children.length; ++i) {
                            const child = children[i];
                            const enableLevelRender = node[`__enableLevelRender`];

                            if (!enableLevelRender) {
                                const uiProps = child._uiProps;
                                const transform = uiProps.uiTransformComp;
                                let sortingEnabled = transform?._sortingEnabled;
                                // sortingPriority = sortingEnabled ? transform._sortingPriority : sortingPriority;
                                if (sortingEnabled) {
                                    this.manualSplit(child, opacity, 0, sortingPriority);
                                } else {
                                    this.walk(child, level);
                                }
                            } else {
                                levelSplit(child, 0, i);
                            }
                        }
                        while (__renderQueue.length > 0) {
                            const list = __renderQueue.shift();
                            if (list.length > 0) {
                                while (list.length > 0) {
                                    const n = list.shift();
                                    this.walk(n, level);
                                }
                            }
                        }
                        while (this.rendererCache.length > 0) {
                            const n = this.rendererCache.shift();
                            this.walk(n, level);
                            // this.walk(n.node, level);
                        }
                    }
                }

                if (uiProps.colorDirty) {
                    // Reduce cascaded color dirty state
                    this._opacityDirty--;
                    // Reset color dirty
                    uiProps.colorDirty = false;
                }
            }
            // Restore opacity
            // this._pOpacity = parentOpacity;

            // Post render assembler update logic
            // ATTENTION: Will also reset colorDirty inside postUpdateAssembler
            if (render && render.enabledInHierarchy) {
                render.postUpdateAssembler(this);
                if (stencilEnterLevel
                    && (StencilManager.sharedManager!.getMaskStackSize() > 0)) {

                    this.autoMergeBatches(this._currComponent!);
                    this.resetRenderStates();
                    StencilManager.sharedManager!.exitMask();
                }
            }


            level += 1;
        }
    });


    function updateOpacity(renderData: RenderData, opacity: number) {
        const vfmt = renderData.vertexFormat;
        const vb = renderData.chunk.vb;
        let attr; let format; let stride;
        // Color component offset
        let offset = 0;
        for (let i = 0; i < vfmt.length; ++i) {
            attr = vfmt[i];
            format = gfx.FormatInfos[attr.format];
            if (format.hasAlpha) {
                stride = renderData.floatStride;
                if (format.size / format.count === 1) {
                    const alpha = ~~clamp(Math.round(opacity * 255), 0, 255);
                    // Uint color RGBA8
                    for (let color = offset; color < vb.length; color += stride) {
                        vb[color] = ((vb[color] & 0xffffff00) | alpha) >>> 0;
                    }
                } else if (format.size / format.count === 4) {
                    // RGBA32 color, alpha at position 3
                    for (let alpha = offset + 3; alpha < vb.length; alpha += stride) {
                        vb[alpha] = opacity;
                    }
                }
            }
            offset += format.size >> 2;
        }
    }

    function updateMiddlewareOpacity(renderData: any, opacity: number) {
        const vb = renderData.chunk.vb;
        let _vUintBuf = new Uint32Array(vb.buffer, vb.byteOffset, vb.length);
        let _vertexFloatOffset = 0;

        for (let v = _vertexFloatOffset; v < _vUintBuf.length; v += 6) {
            let _finalColor32 = _vUintBuf[v + 5];
            _finalColor32 = changeOpacity(_finalColor32, opacity)
            _vUintBuf[v + 5] = _finalColor32;
        }
    }

    function _spineColorToUint32(r, g, b, a) {
        return ((a << 24) >>> 0) + (b << 16) + (g << 8) + r;
    }

    function changeOpacity(uint32Value, opacity: number) {
        var r = uint32Value & 0xFF;
        var g = (uint32Value >> 8) & 0xFF;
        var b = (uint32Value >> 16) & 0xFF;
        var a = (uint32Value >>> 24) & 0xFF;
        a *= opacity;

        return _spineColorToUint32(r, g, b, a);
    }

}
