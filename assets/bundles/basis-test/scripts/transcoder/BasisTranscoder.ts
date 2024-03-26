import { Asset, director, gfx, ImageAsset, Texture2D, __private } from "cc";

/**
 * @en Image source in memory
 * @zh 内存图像源。
 */
export interface IMemoryImageSource {
    _data: ArrayBufferView | null;
    _compressed: boolean;
    width: number;
    height: number;
    format: number;
    mipmapLevelDataSize?: number[];
}

export class BasisTranscoder {
    workerConfig = {
        format: null,
        astcSupported: false,
        etcSupported: false,
        dxtSupported: false,
        pvrtcSupported: false,
        bc7Supported: false,
    };
    useAlpha: boolean = true;
    workerPool: Worker[] = [];
    workerLimit: number = 4;
    workerSourceURL: string;
    transcoderBinary: Uint8Array;
    transcoderPending: Promise<void>;
    workerNextTaskID: number = 1;
    texturePending: Promise<void>;


    constructor() {
        this.detectSupport();
    }
    detectSupport() {

        // @ts-ignore
        let gl: WebGLRenderingContextBase = director.root.device.gl;

        var config = this.workerConfig;

        config.bc7Supported = !!gl.getExtension('EXT_texture_compression_bptc');
        config.astcSupported = !!gl.getExtension('WEBGL_compressed_texture_astc');
        config.etcSupported = !!gl.getExtension('WEBGL_compressed_texture_etc1');
        config.dxtSupported = !!gl.getExtension('WEBGL_compressed_texture_s3tc');
        config.pvrtcSupported = !!gl.getExtension('WEBGL_compressed_texture_pvrtc')
            || !!gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

        if (config.astcSupported) {

            config.format = BASIS_FORMAT.cTFASTC_4x4;

        } else if (config.dxtSupported) { // 与 bc7Supported 调整了顺序

            config.format = BASIS_FORMAT.cTFBC3;

        } else if (config.bc7Supported) {

            config.format = BASIS_FORMAT.cTFBC7_M6_OPAQUE_ONLY;

        } else if (config.etcSupported) {

            config.format = BASIS_FORMAT.cTFETC1;

        } else if (config.pvrtcSupported) {

            config.format = this.useAlpha ? BASIS_FORMAT.cTFPVRTC1_4_RGBA : BASIS_FORMAT.cTFPVRTC1_4_RGB;

        } else {

            throw new Error('No suitable compressed texture format found.');

        }

        return this;

    }


    _initTranscoder(): Promise<void> {
        if (!this.transcoderPending) {
            console.log(`BasisTranscoder-> _initTranscoder000`);
            this.transcoderPending = new Promise<void>((resolve, reject) => {
                console.log(`BasisTranscoder-> _initTranscoder111111`);

                tnt.resourcesMgr.load("basis", "basis-test#scripts/transcoder/basis_transcoder", Asset, (err, binary) => {
                    console.log(`BasisTranscoder-> _initTranscoder2222222`);
                    if (err) {
                        console.error(err);
                        resolve();
                        return;
                    }
                    // @ts-ignore
                    let jsContent = BASIS.toString();

                    let js = `var BASIS = (function() {
                        var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
                        if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
                        return (`

                        + jsContent + `
                        );
                        })();
                        if (typeof exports === 'object' && typeof module === 'object')
                              module.exports = BASIS;
                            else if (typeof define === 'function' && define['amd'])
                              define([], function() { return BASIS; });
                            else if (typeof exports === 'object')
                              exports["BASIS"] = BASIS;
                            `

                    let fn = BasisWorker.toString();
                    let body = [
                        '/* basis_transcoder.js */',
                        js,
                        '/* worker */',
                        fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
                    ].join('\n');

                    this.workerSourceURL = URL.createObjectURL(new Blob([body]));
                    // @ts-ignore
                    this.transcoderBinary = binary.nativeAsset || binary._nativeAsset;

                    console.log(`BasisTranscoder-> _initTranscoder33333`);
                    resolve();
                });
            })
        }
        return this.transcoderPending;
    }

    transcoder(buffer: ArrayBufferView) {
        console.time('basis-transcoder');

        let worker;
        let taskID;

        let taskCost = buffer.byteLength;

        let texturePending = this._allocateWorker(taskCost)
            .then((_worker) => {

                worker = _worker;
                taskID = this.workerNextTaskID++;

                return new Promise((resolve, reject) => {

                    worker._callbacks[taskID] = { resolve, reject };

                    worker.postMessage({ type: 'transcode', id: taskID, buffer, test: 2 }, [buffer]);

                });

            })
            .then((message) => {

                // let config = this.workerConfig;


                let { width, height, mipmaps, format } = message as any;
                let out: IMemoryImageSource = {
                    _data: new Uint8Array(0),
                    _compressed: true,
                    width: width,
                    height: height,
                    format: BASIS_TO_CC_FORMAT[format],
                    mipmapLevelDataSize: [],
                };

                for (let i = 0; i < mipmaps.length; i++) {
                    let levelIndex = i + 1;
                    const mipmap = mipmaps[i];

                    const dstView = new Uint8Array(out._data!.byteLength + mipmap.data.byteLength);
                    dstView.set(out._data as Uint8Array);
                    dstView.set(mipmap.data, out._data!.byteLength);
                    out._data = dstView;
                    out.mipmapLevelDataSize![levelIndex] = mipmap.data.byteLength;
                }
                console.timeEnd('basis-transcoder');
                return out;

                // // let texture;

                // let regions: gfx.BufferTextureCopy[] = [];
                // let buffers: ArrayBufferView[] = [];
                // for (let i = 0; i < mipmaps.length; i++) {
                //     const mipmap = mipmaps[i];
                //     buffers.push(mipmap.data);


                //     const temp = new gfx.BufferTextureCopy();
                //     temp.texOffset.x = 0;
                //     temp.texOffset.y = 0;

                //     temp.texExtent.width = width;
                //     temp.texExtent.height = height;
                //     regions.push(temp)
                // }


                // let texture2D = new Texture2D();
                // texture2D.reset({
                //     width: width,
                //     height: height,
                //     format: BASIS_TO_CC_FORMAT[format]
                // });

                // let gfxTexture = texture2D.getGFXTexture();

                // // @ts-ignore
                // let device = texture2D._getGFXDevice();
                // device.copyBuffersToTexture(buffers, gfxTexture, regions);


                // // // // @ts-ignore
                // // // let CompressedTexture = ImageAsset.parseCompressedTextures;
                // // switch (format) {
                // //     case BASIS_FORMAT.cTFASTC_4x4:
                // //         // texture = new CompressedTexture(mipmaps, width, height, THREE.RGBA_ASTC_4x4_Format);
                // //         break;
                // //     // case BASIS_FORMAT.cTFBC7_M6_OPAQUE_ONLY:
                // //     //     texture = new CompressedTexture(mipmaps, width, height, COMPRESSED_RGBA_BPTC_UNORM);
                // //     //     break;
                // //     // case BASIS_FORMAT.cTFBC1:
                // //     // case BASIS_FORMAT.cTFBC3:
                // //     //     texture = new CompressedTexture(mipmaps, width, height, DXT_FORMAT_MAP[config.format], THREE.UnsignedByteType);
                // //     //     break;
                // //     case BASIS_FORMAT.cTFETC1:

                // //         // texture = new CompressedTexture(mipmaps, width, height, THREE.RGB_ETC1_Format);
                // //         break;
                // //     case BASIS_FORMAT.cTFPVRTC1_4_RGB:
                // //         // texture = new CompressedTexture(mipmaps, width, height, THREE.RGB_PVRTC_4BPPV1_Format);
                // //         break;
                // //     case BASIS_FORMAT.cTFPVRTC1_4_RGBA:
                // //         // texture = new CompressedTexture(mipmaps, width, height, THREE.RGBA_PVRTC_4BPPV1_Format);
                // //         break;
                // //     default:
                // //         throw new Error('No supported format available.');
                // // }

                // // texture.minFilter = mipmaps.length === 1 ? Texture2D.Filter.LINEAR : Texture2D.Filter.NEAREST;
                // // texture.magFilter = Texture2D.Filter.LINEAR;
                // // texture.generateMipmaps = false;
                // // texture.needsUpdate = true;
                // texture2D.image
                // return texture2D;

            });

        texturePending
            .finally(() => {

                if (worker && taskID) {

                    worker._taskLoad -= taskCost;
                    delete worker._callbacks[taskID];

                }

            });

        return texturePending;

    }

    _allocateWorker(taskCost) {

        return this._initTranscoder().then(() => {

            if (this.workerPool.length < this.workerLimit) {
                console.log(`BasisTranscoder-> 4444`);

                let worker = new Worker(this.workerSourceURL);

                // @ts-ignore
                worker._callbacks = {};
                // @ts-ignore
                worker._taskLoad = 0;

                worker.postMessage({
                    type: 'init',
                    config: this.workerConfig,
                    transcoderBinary: this.transcoderBinary,
                });

                worker.onmessage = function (e) {

                    let message = e.data;

                    switch (message.type) {

                        case 'transcode':
                            // @ts-ignore
                            worker._callbacks[message.id].resolve(message);
                            break;

                        case 'error':
                            // @ts-ignore
                            worker._callbacks[message.id].reject(message);
                            break;

                        default:
                            console.error('THREE.BasisTextureLoader: Unexpected message, "' + message.type + '"');

                    }

                };

                this.workerPool.push(worker);

            } else {

                this.workerPool.sort(function (a, b) {
                    // @ts-ignore
                    return a._taskLoad > b._taskLoad ? - 1 : 1;

                });

            }

            let worker = this.workerPool[this.workerPool.length - 1];
            // @ts-ignore
            worker._taskLoad += taskCost;

            return worker;

        });

    }

    dispose() {

        for (let i = 0; i < this.workerPool.length; i++) {
            this.workerPool[i].terminate();
        }

        this.workerPool.length = 0;

        return this;

    }
}




const BASIS_FORMAT = {
    cTFETC1: 0,
    cTFETC2: 1,
    cTFBC1: 2,
    cTFBC3: 3,
    cTFBC4: 4,
    cTFBC5: 5,
    cTFBC7_M6_OPAQUE_ONLY: 6,
    cTFBC7_M5: 7,
    cTFPVRTC1_4_RGB: 8,
    cTFPVRTC1_4_RGBA: 9,
    cTFASTC_4x4: 10,
    cTFATC_RGB: 11,
    cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
    cTFRGBA32: 13,
    cTFRGB565: 14,
    cTFBGR565: 15,
    cTFRGBA4444: 16,
};

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
const DXT_FORMAT = {
    COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
    COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
    COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,
    COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3,
};
const DXT_FORMAT_MAP = {};
DXT_FORMAT_MAP[BASIS_FORMAT.cTFBC1] = DXT_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT;
DXT_FORMAT_MAP[BASIS_FORMAT.cTFBC3] = DXT_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT;

// ASTC formats, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;

// BC7/BPTC format, from:
// https://www.khronos.org/registry/webgl/extensions/EXT_texture_compression_bptc/
const COMPRESSED_RGBA_BPTC_UNORM = 0x8E8C;

// basis 枚举转 cc 枚举
const BASIS_TO_CC_FORMAT = {
    [BASIS_FORMAT.cTFASTC_4x4]: gfx.Format.ASTC_RGBA_4X4,
    [BASIS_FORMAT.cTFETC1]: gfx.Format.ETC_RGB8,
    [BASIS_FORMAT.cTFPVRTC1_4_RGB]: gfx.Format.PVRTC_RGB4,
    [BASIS_FORMAT.cTFPVRTC1_4_RGBA]: gfx.Format.PVRTC_RGBA4,//Texture2D.PixelFormat.RGBA_PVRTC_4BPPV1,

    [BASIS_FORMAT.cTFBC7_M6_OPAQUE_ONLY]: Texture2D.PixelFormat.RGBA_ASTC_4x4, // 没找到合适的枚举
    [BASIS_FORMAT.cTFBC3]: gfx.Format.BC3_SRGB,

}


let BasisWorker = function () {

    let config;
    let transcoderPending;
    let _BasisFile;

    onmessage = function (e) {

        let message = e.data;

        switch (message.type) {

            case 'init':
                config = message.config;
                init(message.transcoderBinary);
                break;

            case 'transcode':
                transcoderPending.then(() => {

                    try {

                        let { width, height, hasAlpha, mipmaps, format } = transcode(message.buffer);

                        let buffers = [];

                        for (let i = 0; i < mipmaps.length; ++i) {

                            buffers.push(mipmaps[i].data.buffer);

                        }

                        // @ts-ignore
                        self.postMessage({ type: 'transcode', id: message.id, width, height, hasAlpha, mipmaps, format }, buffers);

                    } catch (error) {

                        console.error(error);

                        self.postMessage({ type: 'error', id: message.id, error: error.message });

                    }

                });
                break;

        }

    };

    function init(wasmBinary) {

        let BasisModule;
        transcoderPending = new Promise((resolve) => {

            BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
            // @ts-ignore
            BASIS(BasisModule);

        }).then(() => {

            let { BasisFile, initializeBasis } = BasisModule;

            _BasisFile = BasisFile;

            initializeBasis();

        });

    }

    function transcode(buffer) {

        let basisFile = new _BasisFile(new Uint8Array(buffer));

        let width = basisFile.getImageWidth(0, 0);
        let height = basisFile.getImageHeight(0, 0);
        let levels = basisFile.getNumLevels(0);
        let hasAlpha = basisFile.getHasAlpha();

        function cleanup() {

            basisFile.close();
            basisFile.delete();

        }

        if (!hasAlpha) {

            switch (config.format) {

                case 9: // Hardcoded: .BASIS_FORMAT.cTFPVRTC1_4_RGBA
                    config.format = 8; // Hardcoded: .BASIS_FORMAT.cTFPVRTC1_4_RGB;
                    break;
                default:
                    break;

            }

        }

        if (!width || !height || !levels) {

            cleanup();
            throw new Error('BasisTranscoder:  Invalid .basis file');

        }

        if (!basisFile.startTranscoding()) {

            cleanup();
            throw new Error('BasisTranscoder: .startTranscoding failed');

        }

        let mipmaps = [];

        for (let mip = 0; mip < levels; mip++) {

            let mipWidth = basisFile.getImageWidth(0, mip);
            let mipHeight = basisFile.getImageHeight(0, mip);
            let dst = new Uint8Array(basisFile.getImageTranscodedSizeInBytes(0, mip, config.format));

            let status = basisFile.transcodeImage(
                dst,
                0,
                mip,
                config.format,
                0,
                hasAlpha
            );

            if (!status) {

                cleanup();
                throw new Error('BasisTranscoder: .transcodeImage failed.');

            }
            mipmaps.push({ data: dst, width: mipWidth, height: mipHeight });
        }

        cleanup();

        return { width, height, hasAlpha, mipmaps, format: config.format };

    }
}