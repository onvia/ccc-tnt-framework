
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

declare global{
    interface ITNT{
        mouse: MouseMgr;
    }
}

export class MouseMgr {


    on(target: IMouse, node?: Node) {
        if (typeof node == "undefined") {
            //@ts-ignore
            node = target.node;
        }
        target.onMouseDown && node.on(Node.EventType.MOUSE_DOWN, target.onMouseDown, target);
        target.onMouseUp && node.on(Node.EventType.MOUSE_UP, target.onMouseUp, target);
        target.onMouseWheel && node.on(Node.EventType.MOUSE_WHEEL, target.onMouseWheel, target);
        target.onMouseEnter && node.on(Node.EventType.MOUSE_ENTER, target.onMouseEnter, target);
        target.onMouseLeave && node.on(Node.EventType.MOUSE_LEAVE, target.onMouseLeave, target);
        target.onMouseMove && node.on(Node.EventType.MOUSE_MOVE, target.onMouseMove, target);

    }

    off(target: IMouse, node?: Node) {
        if (typeof node == "undefined") {
            //@ts-ignore
            node = target.node;
        }

        target.onMouseDown && node.off(Node.EventType.MOUSE_DOWN, target.onMouseDown, target);
        target.onMouseUp && node.off(Node.EventType.MOUSE_UP, target.onMouseUp, target);
        target.onMouseWheel && node.off(Node.EventType.MOUSE_WHEEL, target.onMouseWheel, target);

        
        target.onMouseEnter && node.off(Node.EventType.MOUSE_ENTER, target.onMouseEnter, target);
        target.onMouseLeave && node.off(Node.EventType.MOUSE_LEAVE, target.onMouseLeave, target);
        target.onMouseMove && node.off(Node.EventType.MOUSE_MOVE, target.onMouseMove, target);
    }

    private static _instance:MouseMgr = null
    public static getInstance(): MouseMgr{
        if(!this._instance){
            this._instance = new MouseMgr();
        }
        return this._instance;
    }
}

export const mouse = MouseMgr.getInstance();
tnt.mouse = mouse;