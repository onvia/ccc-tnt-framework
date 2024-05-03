import { director, Layers, misc, utils } from "cc";
import { MeshRenderer } from "cc";
import { profiler } from "cc";
import { CCObject } from "cc";
import { game } from "cc";
import { Material } from "cc";
import { Profiler } from "cc";
import { Node } from "cc";
import { JSB } from "cc/env";

const _constants = {
    fontSize: 23,
    quadHeight: 0.4,
    segmentsPerLine: 8,
    textureWidth: 256,
    textureHeight: 256,
};

if(JSB){
    //@ts-ignore
    const Node_ctor = Node.prototype._ctor;
    //@ts-ignore
    Node.prototype._ctor = function (name?: string) {
        Node_ctor.call(this, name);
        
        const sharedArrayBuffer = this._getSharedArrayBufferObject();
        // Uint32Array with 3 elements: eventMask, layer, dirtyFlags
        this._sharedUint32Arr = new Uint32Array(sharedArrayBuffer, 0, 3);
        // Int32Array with 1 element: siblingIndex
        this._sharedInt32Arr = new Int32Array(sharedArrayBuffer, 12, 1);
        // uiSortingPriority
        this._sharedFloatArr = new Float32Array(sharedArrayBuffer, 16, 1);
        // Uint8Array with 3 elements: activeInHierarchy, active, static, uiSortingEnabled
        this._sharedUint8Arr = new Uint8Array(sharedArrayBuffer, 20, 4);

        this._sharedUint32Arr[1] = Layers.Enum.DEFAULT; // this._sharedUint32Arr[1] is layer
    };

    Object.defineProperty(Node.prototype, 'uiSortingEnabled', {
        configurable: true,
        enumerable: true,
        get (): Readonly<Boolean> {
            return this._sharedUint8Arr[3] != 0; // Uint8, 1: active
        },
        set (v) {
            this._sharedUint8Arr[3] = (v ? 1 : 0); // Uint8, 1: active
        },
    });

    Object.defineProperty(Node.prototype, 'uiSortingPriority', {
        configurable: true,
        enumerable: true,
        get (): Readonly<number> {
            return this._sharedFloatArr[0];
        },
        set (v) {
            this._sharedFloatArr[0] = v;
        },
    });

    // 左下角调试节点创建过早，重新创建
    //@ts-ignore
    if (profiler._rootNode && profiler._rootNode.isValid){
        //@ts-ignore
        profiler._rootNode.destroy();
        //@ts-ignore
        profiler._rootNode = null;

        profiler.generateNode();
    }
}
