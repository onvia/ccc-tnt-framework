
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

declare global {
    interface ITNT {
        mouse: MouseMgr;
    }
}

const useCaptureMap: WeakMap<IMouse, boolean> = new WeakMap();
export class MouseMgr {


    on(target: IMouse, node?: Node, useCapture: boolean = false) {
        if (typeof node == "undefined") {
            //@ts-ignore
            node = target.node;
        }
        useCaptureMap.set(target, useCapture)
        target.onMouseDown && node.on(Node.EventType.MOUSE_DOWN, target.onMouseDown, target, useCapture);
        target.onMouseUp && node.on(Node.EventType.MOUSE_UP, target.onMouseUp, target, useCapture);
        target.onMouseWheel && node.on(Node.EventType.MOUSE_WHEEL, target.onMouseWheel, target, useCapture);
        target.onMouseEnter && node.on(Node.EventType.MOUSE_ENTER, target.onMouseEnter, target, useCapture);
        target.onMouseLeave && node.on(Node.EventType.MOUSE_LEAVE, target.onMouseLeave, target, useCapture);
        target.onMouseMove && node.on(Node.EventType.MOUSE_MOVE, target.onMouseMove, target, useCapture);

    }

    off(target: IMouse, node?: Node) {
        if (typeof node == "undefined") {
            //@ts-ignore
            node = target.node;
        }

        let useCapture = useCaptureMap.get(target);
        target.onMouseDown && node.off(Node.EventType.MOUSE_DOWN, target.onMouseDown, target, useCapture);
        target.onMouseUp && node.off(Node.EventType.MOUSE_UP, target.onMouseUp, target, useCapture);
        target.onMouseWheel && node.off(Node.EventType.MOUSE_WHEEL, target.onMouseWheel, target, useCapture);


        target.onMouseEnter && node.off(Node.EventType.MOUSE_ENTER, target.onMouseEnter, target, useCapture);
        target.onMouseLeave && node.off(Node.EventType.MOUSE_LEAVE, target.onMouseLeave, target, useCapture);
        target.onMouseMove && node.off(Node.EventType.MOUSE_MOVE, target.onMouseMove, target, useCapture);
    }

    private static _instance: MouseMgr = null
    public static getInstance(): MouseMgr {
        if (!this._instance) {
            this._instance = new MouseMgr();
        }
        return this._instance;
    }
}

export const mouse = MouseMgr.getInstance();
tnt.mouse = mouse;