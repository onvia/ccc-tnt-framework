
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;




declare global {
    interface ITNT {
        elementMgr: ElementMgr;
    }
    
    namespace tnt {
        interface IElement<T> {
            name: string;
            info: T;
            type: number;
            id: number;
            num: number;
            own: number;
            icon: string;
            desc: string;
            quality: number;
        }
        
        interface IElementMgr {        
            convert<T = any>(type: number, id?: number, num?: number): IElement<T>;
        }
    }
}

@ccclass('ElementMgr')
class ElementMgr implements tnt.IElementMgr {
    mgr: tnt.IElementMgr = null;

    convert<T = any>(type: number, id?: number, num?: number): tnt.IElement<T> {
        if (!this.mgr) {
            throw new Error("ElementMgr 未实现");
        }
        return this.mgr.convert(type, id, num);
    }

    private static _instance: ElementMgr = null;
    public static getInstance(): ElementMgr {
        if (!this._instance) {
            this._instance = new ElementMgr();
        }
        return this._instance;
    }
}

tnt.elementMgr = ElementMgr.getInstance();

export { };