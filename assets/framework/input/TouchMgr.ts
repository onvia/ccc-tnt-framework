import { director, EventTouch, ISchedulable, macro, Node, Scheduler }from "cc";

declare global{
    interface ITNT{
        touch: TouchMgr;
    }
}

type LongPressCallBack = (count: number) => void;
export class TouchMgr {

    private _longPressMap: Map<string,LongPress> = new Map();

    on(target: ITouch, node?: Node) {
        if (typeof node == "undefined") {
            //@ts-ignore
            node = target.node;
        }
        node.on(Node.EventType.TOUCH_START, target.onTouchBegan, target);
        node.on(Node.EventType.TOUCH_MOVE, target.onTouchMoved, target);
        node.on(Node.EventType.TOUCH_END, target.onTouchEnded, target);
        node.on(Node.EventType.TOUCH_CANCEL, target.onTouchCancel, target);
    }

    off(target: ITouch, node?: Node) {
        if (typeof node == "undefined") {
            //@ts-ignore
            node = target.node;
        }

        node.off(Node.EventType.TOUCH_START, target.onTouchBegan, target);
        node.off(Node.EventType.TOUCH_MOVE, target.onTouchMoved, target);
        node.off(Node.EventType.TOUCH_END, target.onTouchEnded, target);
        node.off(Node.EventType.TOUCH_CANCEL, target.onTouchCancel, target);
    }


    /**
     * 注册长按 需要与 offLongPress 成对出现
     * @param node 
     * @param longPressCallBack 长按回调
     * @param target 
     * @param touchInterval 触摸回调间隔（秒）
     * @returns 
     */
    onLongPress(node: Node,longPressCallBack: LongPressCallBack,target: Object,touchInterval: number = 0.1) {
        if(this._longPressMap.has(node.uuid)){
            return;
        }
        let longPress = new LongPress(node,touchInterval);
        longPress.longPressCallBack = longPressCallBack.bind(target);
        this._longPressMap.set(node.uuid,longPress);
        this.on(longPress,node);
    }

    offLongPress(node: Node) {
        if(!this._longPressMap.has(node.uuid)){
            return;
        }
        let longPress = this._longPressMap.get(node.uuid);
        this._longPressMap.delete(node.uuid);
        this.off(longPress,node);
    }

    clear(){
        this._longPressMap.clear();
    }

    private static instance: TouchMgr = null;
    public static getInstance(): TouchMgr {
        if (!this.instance) {
            this.instance = new TouchMgr();
        }
        return this.instance;
    }
}
tnt.touch = TouchMgr.getInstance();
class LongPress implements ITouch, ISchedulable{
    declare id?: string;
    declare uuid?: string;

    private _isTouching: boolean = false;
     
    private _touchCounter: number = 0;
    
    private _isLongPress: boolean = false;

    longPressCallBack: LongPressCallBack = null;

    constructor(readonly node: Node,readonly touchInterval: number = 0.1) {
        Scheduler.enableForTarget(this);
    }
    onTouchBegan(event: EventTouch) {
         if (this._isTouching) {
                return;
            }
            this._isTouching = true;

            if (this._isTouching) {
                // 然后开启计时器，计算后续的长按相当于触摸了多少次
                director.getScheduler().schedule(this._touchCounterCallback,this, this.touchInterval, macro.REPEAT_FOREVER, 0, false);
            }
    }
    onTouchMoved(event: EventTouch) {
        
    }
    onTouchEnded(event: EventTouch) {
      if(!this._isLongPress){
        this.longPressCallBack(++this._touchCounter);
      }
      director.getScheduler().unschedule(this._touchCounterCallback,this);
      this._isTouching = false;
      this._isLongPress = false;
      this._touchCounter = 0;
    }
    onTouchCancel(event: EventTouch) {
        this.onTouchEnded(event);
    }

    _touchCounterCallback(){
        this._isLongPress = true;
        this.longPressCallBack(++this._touchCounter);
    }
    
}