
import { Node, EventTouch, EventKeyboard, Button, Component, KeyCode, __private, EventMouse, Scene } from "cc";

declare global {

    type GConstructor<T = unknown> = new (...args: any[]) => T;

    type Runnable1<T> = (param: T) => any;
    type Runnable2<T1, T2> = (param1: T1, param2: T2) => any;
    type Runnable3<T1, T2, T3> = (param1: T1, param2: T2, param3: T3) => any;
    type Runnable = (...args: any[]) => any;
    type TouchEventFunc = (event: EventTouch) => any;

    type Opts<T> = { [Key in keyof T]?: Key };
    type K2V<B> = Opts<B>[keyof B];


    // interface IToast<Options> {
    //     show(text: string, options?: Options);
    // }

    // 事件管理接口
    interface IEventified {
        on(key: any, listener?: any, target?: any, priority?: number, ...args: any): void;
        once(key: any, listener?: any, target?: any, priority?: number, ...args: any): void;
        off(key: any, listener: any, target?: any): void;
        offAllOfKey(key: any): void;
        targetOff(target: any): void;
        emit(key: any, ...args): void;
        emitSticky(key: any, ...args): void;
        hasEventListener(key: any, listener: any, target: any): boolean;
        hasEvent(key: any): boolean;
        clear(): void;
    }

    interface IKeyboard {
        /** 返回键 */
        onKeyBack(event: EventKeyboard);
        /** 按键抬起 */
        onKeyUp(event: EventKeyboard);
        /** 按键按下 */
        onKeyDown(event: EventKeyboard);
        /** 按压中 */
        onKeyPressing?(event: EventKeyboard);
        /** 组合键 */
        onKeyCombination?(ctrlKey: KeyCode, mainKey: KeyCode);
        /** 组合键按压中 */
        onKeyCombinationPressing?(ctrlKey: KeyCode, mainKey: KeyCode);
    }

    interface ITouch {
        onTouchBegan(event: EventTouch);
        onTouchMoved(event: EventTouch);
        onTouchEnded(event: EventTouch);
        onTouchCancel(event: EventTouch);
    }

    interface IMouse {
        onMouseDown(event: EventMouse);
        onMouseUp(event: EventMouse);
        onMouseWheel?(event: EventMouse);

        onMouseEnter?(event: EventMouse);
        onMouseLeave?(event: EventMouse);
        onMouseMove?(event: EventMouse);
    }

    interface ISceneListener {

        /** 进入场景，过渡动画开始 */
        onEnterTransitionStart?(sceneName?: string);
        /** 进入场景，过渡动画将要结束 */
        onEnterTransitionWillFinished?(sceneName?: string);
        /** 进入场景，过渡动画结束 */
        onEnterTransitionFinished?(sceneName?: string);


        /** 退出场景，过渡动画开始 */
        onExitTransitionStart?(sceneName?: string);
        /** 退出场景，过渡动画将要结束 */
        onExitTransitionWillFinished?(sceneName?: string);
        /** 退出场景，过渡动画结束 */
        onExitTransitionFinished?(sceneName?: string);


    }

    interface ILoaderKeyAble {
        loaderKey: string;
    }

    interface UIPanelPack<T extends tnt.UIPanel> {
        ctor: GConstructor<T>
        name: string;
        instance: T;
        container: Node;
        param: any;
        isChecked: boolean;
    }
    /**
     * 
     */
    interface IUIAble<T extends tnt.UIPanel = any> extends ILoaderKeyAble {

        // uiPanelPackArray: Array<UIPanelPack<T>>;
        uiPanelPackMap: Record<string, Array<UIPanelPack<T>>>;
        uiPanelParentMap: Record<string, string>;


        registeButtonClick(node: Node | Button | string, cb: () => void, target?: any);

        find(path: string, parentOrRefresh?: Node | Scene | boolean, refresh?: boolean);
        findComponent<T extends Component>(path: string, type: __private._types_globals__Constructor<T>, parentOrRefresh?: Node | boolean, refresh?: boolean): T | null;
    }


    interface IUIWindowPlugin {
        name: string;
        // 优先级，越大越先执行
        priority?: number;

        onUIMgrReInit?();

        onWindowCreated?(view: tnt.UIWindowBase, name: string);

        onWindowShowBefor?(view: tnt.UIWindowBase, name: string);

        onWindowShowAfter?(view: tnt.UIWindowBase, name: string);

        onWindowClose?(view: tnt.UIWindowBase, name: string);

        onBeClean?(view: tnt.UIWindowBase, name: string);

        onWindowDestroy?(view: tnt.UIWindowBase, name: string);


        onPluginRegister?();
        onPluginUnRegister?();
    }


}