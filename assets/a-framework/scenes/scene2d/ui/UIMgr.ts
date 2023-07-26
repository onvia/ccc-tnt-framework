
import { _decorator, Node, isValid, UITransform, view, Tween, BlockInputEvents, UIOpacity, v3, Layers, Sprite, Color, assetManager, SpriteFrame, js, error, instantiate, Prefab, tween, Label, find, dynamicAtlasManager, Camera, RenderTexture, Widget } from "cc";
import { DEBUG, EDITOR } from "cc/env";
import "../../../decorators/_decorator";
const { ccclass } = _decorator;
const { pluginMgr } = tnt._decorator;

// type UIItemShowCallback<T extends KeyGlobalUIType> = (window: Key_Global_UI_Item_Ctor<T>)=> void;
type WindowShownCallback<T extends Key_Global_Window_Type> = Runnable1<Key_Global_UI_Window_Ctor<T>>;

// type ShowPluginCallback<T extends tnt.UIPanel> = (ins: T,isInit: boolean)=> void;
type UIQueueRemoveFilter<T extends Key_Global_Window_Type> = (opts: UIQueueOpts<T>, index: number, arr: Array<UIQueueOpts<T>>) => boolean;
type AssetLoader = tnt.AssetLoader;
declare global {

    type ShowPluginResult<T extends tnt.UIPanel> = { ins: T, isInit: boolean };

    type Key_Global_UI_Type = keyof GlobalUIType;
    type Key_Global_Window_Type = keyof GlobalWindowType;

    type Key_Global_UI_Item_Ctor<T extends Key_Global_UI_Type> = GlobalUIType[T]["ctor"];
    type Key_Global_UI_Item_Options<T extends Key_Global_UI_Type> = GlobalUIType[T]["options"];

    type Key_Global_UI_Window_Ctor<T extends Key_Global_Window_Type> = GlobalWindowType[T]["ctor"];
    type Key_Global_UI_Window_Options<T extends Key_Global_Window_Type> = GlobalWindowType[T]["options"];

    interface ITNT {
        uiMgr: UIMgr;
    }

    interface IPluginType {
        UIMgr: IUIMgrPlugin;
    }

    interface UIQueueOpts<T extends Key_Global_Window_Type> {
        /** 预制体路径参数 */
        ctor: T;

        data?: Key_Global_UI_Window_Options<T>;
        options?: UIOptions1<T>;
    }

    /** 背景层 */
    interface IMaskLayerController {

        onUIMgrInitialize();

        /** 弹窗创建之后可以预先加载或创建蒙版节点 */
        onWindowCreateBefore(windowName: string);

        /** 返回 mask 节点 */
        onWindowCreateAfter(view: tnt.UIWindowBase): Node;

        /** 销毁弹窗 回收 mask */
        onWindowDestroy(view: tnt.UIWindowBase, mask: Node);
    }

}


interface StageWindow {
    oldScene: string;
    newScene: string;

    stack: tnt.UIWindowBase[];
    currentShowUI: Record<string, Array<tnt.UIWindowBase>>;
}

interface UIOptions1<T extends Key_Global_Window_Type> {
    /** 是否使用遮罩 */
    isRequireMask?: boolean;
    callback?: WindowShownCallback<T>;
}

interface UIOptions2<T> {
    /** 是否使用遮罩 */
    isRequireMask?: boolean;
    callback?: Runnable1<T>;
}


function updateFrameSize(node: Node) {
    if (!node || !isValid(node)) {
        return;
    }
    let size = view.getVisibleSize();
    let uiTransform = node.getComponent(UITransform);
    if (!uiTransform) {
        uiTransform = node.addComponent(UITransform);
    }
    uiTransform.width = size.width;
    uiTransform.height = size.height;
    return size;
}



/** 弹窗根节点池 */
let rootNodePool = new tnt.NodePool({
    maxCount: 16,
    newObject: () => {
        let node = new Node();
        let uiOpacity = node.getComponent(UIOpacity);
        updateFrameSize(node);
        if (!uiOpacity) {
            uiOpacity = node.addComponent(UIOpacity);
        }
        uiOpacity.opacity = 255;
        node.layer = Layers.Enum.UI_2D;
        return node;
    },
    reset: (node) => {
        if (!node || !isValid(node)) {
            return false;
        }
        node.destroyAllChildren();
        Tween.stopAllByTag(ACTION_TAG, node);
        let uiOpacity = node.getComponent(UIOpacity);
        let blockInputEvents = node.getComponent(BlockInputEvents);

        updateFrameSize(node);

        node.position = v3(0, 0, 0);
        uiOpacity.opacity = 255;
        if (blockInputEvents) {
            blockInputEvents.destroy();
        }

        return true;
    }
});

let maskNodePoolOptions: IPoolOptions<Node> = {
    maxCount: 16,
    newObject: () => {
        let node = new Node();
        let sprite = node.addComponent(Sprite);
        let uiOpacity = node.addComponent(UIOpacity);
        uiOpacity.opacity = 126;

        node.layer = Layers.Enum.UI_2D;
        node.name = "UIMask";

        // 单色图
        assetManager.loadBundle("framework", (err, bundle) => {
            if (err) {
                console.warn(`UIMgr-> 没有 [framework] bundle`);
                return;
            }
            bundle.load("resources/texture/default_sprite_splash/spriteFrame", SpriteFrame, (err, texture) => {
                sprite.spriteFrame = texture;
                texture.addRef();
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                sprite.color = Color.BLACK;
                updateFrameSize(node);
            })
        });
        return node;
    },
    reset: (node) => {
        if (!node || !isValid(node)) {
            return false;
        }
        Tween.stopAllByTag(ACTION_TAG, node);
        node.name = "UIMask";
        let uiOpacity = node.getComponent(UIOpacity);
        let sprite = node.getComponent(Sprite);
        let blockInputEvents = node.getComponent(BlockInputEvents);

        node.position = v3(0, 0, 0);
        updateFrameSize(node);
        if (uiOpacity) {
            Tween.stopAllByTag(ACTION_TAG, uiOpacity);
            uiOpacity.opacity = 255;
        }
        if (sprite) {
            sprite.color = Color.BLACK;
        }
        blockInputEvents?.destroy();
        return true;
    }
};
/** 蒙版节点池 */
let maskNodePool = new tnt.NodePool(maskNodePoolOptions);

const ACTION_TAG = 10000;

/** 弹窗冻结的计数，归零时取消冻结 */
const windowFrozenCount: WeakMap<tnt.UIWindowBase, number> = new WeakMap();
/** 弹窗冻结了哪些弹窗的 */
const windowFrozenMap: WeakMap<tnt.UIWindowBase, tnt.UIWindowBase[]> = new WeakMap();
/** 保存弹窗【是否关闭其他窗口】原始值 */
const windowIsHideOtherWindows: WeakMap<tnt.UIWindowBase, boolean> = new WeakMap();

@pluginMgr("UIMgr")
@ccclass("UIMgr")
export class UIMgr extends tnt.EventMgr implements IPluginMgr {

    public static ___plugins: IUIMgrPlugin[] = [];

    public readonly Event = {
        All_VIEW_CLOSED: 'All_VIEW_CLOSED',
        WILL_SHOW_VIEW: "WILL_SHOW_VIEW",
        WILL_CLOSE_VIEW: "WILL_CLOSE_VIEW",
        SHOWN_VIEW: 'SHOWN_VIEW',
        CLOSED_VIEW: 'CLOSE_VIEW',
    };

    get loader(): AssetLoader {
        if (EDITOR) {
            return;
        }
        let uiLoader = tnt.loaderMgr.get(tnt.loaderMgr.KEY_UI_MGR);
        return uiLoader;
    }

    //“栈”结构表示的“当前UI窗体”集合。
    private _stack: tnt.UIWindowBase[] = [];

    //当前显示状态的UI窗体集合
    private _currentShowUI: Record<string, Array<tnt.UIWindowBase>> = {};

    //ui 队列， 顺序显示
    private _uiQueue: UIQueueOpts<keyof GlobalWindowType>[] = [];

    private _maskLayerController: IMaskLayerController = null;
    public get maskLayerController(): IMaskLayerController {
        if (!this._maskLayerController) {
            this._maskLayerController = new DefaultMaskLayerController()
        }
        return this._maskLayerController;
    }

    public setMaskLayerController(value: IMaskLayerController) {
        if (this._maskLayerController === value) {
            return;
        }
        this._maskLayerController = value;
        value?.onUIMgrInitialize();
    }

    private uiBlockInput: Node = null;
    private windowRoot: Node = null;

    public _initialize() {
        this.uiBlockInput = this.getUIBlockInput();
        this.windowRoot = this.getUIWindowRoot();
        // 
        this._generateUIRoot();

        this.closeBlockInput();
        this._onUIMgrReInit();
        this.maskLayerController.onUIMgrInitialize();
    }

    private _generateUIRoot() {

        let uiRoot = find("Canvas/UIRoot");
        if (!uiRoot) {
            let canvas = find("Canvas");
            if (!canvas) {
                console.log(`UIMgr-> 无法生成 UIRoot 结构`);
                return;
            }
            uiRoot = this._createFullScreenNode(canvas, "UIRoot");
        }
        if (!this.windowRoot) {
            this.windowRoot = this._createFullScreenNode(uiRoot, "WindowRoot");
        }
        if (!this.uiBlockInput) {
            this.uiBlockInput = this._createFullScreenNode(uiRoot, "UIBlockInput");
            this.uiBlockInput.addComponent(BlockInputEvents);
        }

        console.log(`UIMgr-> 自动生成 UIMgr 所需节点`);

    }

    private _createFullScreenNode(parent: Node, name: string) {

        let node = new Node();
        node.parent = parent;
        node.name = name;
        node.addComponent(UITransform);
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }

        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;

        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignBottom = true;
        widget.isAlignTop = true;

        return node;
    }

    /** 依次显示的界面队列 */
    public addToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T>)
    public addToQueue<T extends Key_Global_Window_Type>(ctor: T, callback?: WindowShownCallback<T>)
    public addToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T>, options?: UIOptions1<T>)
    public addToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T>, callback?: WindowShownCallback<T>)
    public addToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T> | WindowShownCallback<T>, optionsOrCallback?: UIOptions1<T> | WindowShownCallback<T>) {

        let opts = this._parseQueueArgs(ctor, data, optionsOrCallback);

        this._uiQueue.push(opts);

        // 预加载
        this._preloadQueueWindow(opts.ctor, opts.data);

    }

    /** 插入到队列 */
    public insertToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T>)
    public insertToQueue<T extends Key_Global_Window_Type>(ctor: T, callback?: WindowShownCallback<T>)
    public insertToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T>, options?: UIOptions1<T>)
    public insertToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T>, callback?: WindowShownCallback<T>)
    public insertToQueue<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T> | WindowShownCallback<T>, optionsOrCallback?: UIOptions1<T> | WindowShownCallback<T>) {
        let opts = this._parseQueueArgs(ctor, data, optionsOrCallback);

        this._uiQueue.unshift(opts);

        // 预加载
        this._preloadQueueWindow(opts.ctor, opts.data);
    }

    private _parseQueueArgs<T extends Key_Global_Window_Type>(ctor: T, data?: Key_Global_UI_Window_Options<T> | WindowShownCallback<T>, optionsOrCallback?: UIOptions1<T> | WindowShownCallback<T>) {

        let opts: UIQueueOpts<T> = {
            ctor,
            options: Object.create(null)
        };

        if (optionsOrCallback) {
            opts.data = data;
            if (typeof optionsOrCallback == "function") {
                opts.options.callback = optionsOrCallback;
            } else {
                opts.options = optionsOrCallback;
            }
        } else if (typeof data !== 'undefined') {
            if (typeof data !== 'function') {
                opts.data = data;
            } else {
                opts.options.callback = data as any
            }
        }

        return opts;
    }

    /**
     * 从队列移除
     * @template T
     * @param {(T | ((opts: UIQueueOpts<T>)=> boolean))} ctor
     */
    public removeFromQueue<T extends Key_Global_Window_Type>(ctor: T)
    public removeFromQueue<T extends Key_Global_Window_Type>(filter: UIQueueRemoveFilter<T>)
    public removeFromQueue<T extends Key_Global_Window_Type>(ctor: T | UIQueueRemoveFilter<T>) {
        if (typeof ctor == 'function') {
            let array = this._uiQueue.filter(ctor);
            array.forEach((value) => {
                this._uiQueue.fastRemove(value);
            });
            array.length = 0
            return;
        }

        this._uiQueue.removeOne((value) => {
            return value.ctor == ctor;
        });
    }

    /**
     * 显示队列里的窗口
     * @param callback 
     */
    public showQueue(callback?: () => void) {
        if (this._uiQueue.length <= 0) {
            callback?.();
            return;
        }
        let ui = this._uiQueue.shift();
        let _callback = ui.options.callback;
        ui.options.callback = (view) => {
            if (view) {
                _callback?.(view);
                view.addCloseListener(() => {
                    this.showQueue(callback);
                });
            }
        }
        this.showWindow(ui.ctor, ui.data, ui.options);
    }

    /**
     * 预加载队列里的弹窗
     *
     * @param {*} ctor
     * @param {*} param
     */
    private _preloadQueueWindow(ctor, param) {

        let _windowCtor: GConstructor<tnt.UIWindowBase> = null;
        if (typeof ctor === 'string') {
            _windowCtor = js.getClassByName(ctor) as GConstructor<tnt.UIWindowBase>;
        } else {
            _windowCtor = ctor;
        }

        let { prefabUrl, bundle } = tnt.resourcesMgr._parseAssetUrl(_windowCtor, param);
        this.loader.preload(prefabUrl, Prefab, bundle);
    }

    /**
     * 显示弹窗
     *
     * @template T
     * @param {T} clazz
     * @param {Key_Global_UI_Window_Options<T>} [data]
     * @memberof UIMgr
     */
    public showWindow<T extends Key_Global_Window_Type>(clazz: T, data?: Key_Global_UI_Window_Options<T>)
    public showWindow<T extends Key_Global_Window_Type>(clazz: T, callback?: WindowShownCallback<T>)
    public showWindow<T extends Key_Global_Window_Type>(clazz: T, data?: Key_Global_UI_Window_Options<T>, options?: UIOptions1<T>)
    public showWindow<T extends Key_Global_Window_Type>(clazz: T, data?: Key_Global_UI_Window_Options<T>, callback?: WindowShownCallback<T>)
    public showWindow<T extends Key_Global_Window_Type>(clazz: T, data?: Key_Global_UI_Window_Options<T> | WindowShownCallback<T>, optionsOrCallback?: UIOptions1<T> | WindowShownCallback<T>) {
        let _clazz: GConstructor<tnt.UIWindowBase> = null;

        let name = "";
        if (typeof clazz === 'string') {
            name = clazz;
            _clazz = js.getClassByName(clazz) as any;
            if (!_clazz) {
                console.error(`UIMgr-> `, clazz, `无法找到 ${name} 类`);
                return;
            }
        } else {
            name = js.getClassName(clazz);
            _clazz = clazz;
            if (!name) {
                console.error(`UIMgr-> `, _clazz, "没有设置 类名，请使用类装饰器 @ccclass('xxx') 注入类名");
                return;
            }
        }

        this.showWindowByClass(_clazz, data, optionsOrCallback);
    }

    public showWindowByClass<Data, T extends tnt.UIWindowBase<Data> = any>(clazz: GConstructor<T>, data?: Data)
    public showWindowByClass<Data, T extends tnt.UIWindowBase<Data> = any>(clazz: GConstructor<T>, callback?: Runnable1<T>)
    public showWindowByClass<Data, T extends tnt.UIWindowBase<Data> = any>(clazz: GConstructor<T>, data?: Data, options?: UIOptions2<T>)
    public showWindowByClass<Data, T extends tnt.UIWindowBase<Data> = any>(clazz: GConstructor<T>, data?: Data, callback?: Runnable1<T>)
    public showWindowByClass<Data, T extends tnt.UIWindowBase<Data> = any>(clazz: GConstructor<T>, data?: Data, optionsOrCallback?: UIOptions2<T> | Runnable1<T>)
    public showWindowByClass<Data, T extends tnt.UIWindowBase<Data> = any>(clazz: GConstructor<T>, data?: Data, optionsOrCallback?: UIOptions2<T> | Runnable1<T>) {

        let _data: Data = null;
        let _options: UIOptions2<T> = Object.create(null);
        if (optionsOrCallback) {
            _data = data;
            if (typeof optionsOrCallback == "function") {
                _options = {
                    callback: optionsOrCallback,
                };
            } else {
                _options = optionsOrCallback;
            }
        } else if (typeof data !== 'undefined') {
            if (typeof data !== 'function') {
                _data = data;
            } else {
                _options = {
                    callback: data as any,
                }
            }
        }

        let _clazz: GConstructor<tnt.UIWindowBase<Data>> = clazz;
        let name = js.getClassName(_clazz);
        if (!name) {
            console.error(`UIMgr-> `, _clazz, "没有设置 类名，请使用类装饰器 @ccclass('xxx') 注入类名");
            return;
        }

        if (this.isShowing(name)) {
            let _window = this.getWindow(name);
            if (_window._isUniqueness) {
                this._removeOutWindow(name);
                _options?.callback?.(_window as any);
                return;
            }
        }


        let windowRoot = this.windowRoot;
        if (!windowRoot) {
            error("Canvas/UIRoot/WindowRoot not be find");
        }
        let windowName = name;
        this.showBlockInput();

        let isRequireMask = _options.isRequireMask ?? true;
        if (isRequireMask) {
            this.maskLayerController.onWindowCreateBefore(windowName);
        }

        tnt.resourcesMgr.loadPrefabNode(this.loader, _clazz, _data).then((_window) => {
            _window.root = rootNodePool.get();
            if (isRequireMask && _window._isRequireMask) {
                _window.mask = this.maskLayerController.onWindowCreateAfter(_window);
            }
            // let uiOpacity = view.mask.getComponent(UIOpacity);
            // uiOpacity.opacity = 0; // 在动态加载阶段不显示蒙版
            if (_window.mask) {
                _window.mask.parent = _window.root;
                _window.mask.name = `${windowName}Mask`;
            }
            _window.root.name = `${windowName}Root`;
            _window.root.parent = windowRoot;
            _window.root.active = true;

            if (_window.loaderKey === this.loader.key) {
                let index = _window.name.indexOf("<")
                _window.loaderKey = _window.name.substring(index, _window.name.length) + "" + _window.uuid;
            }
            _window.node.parent = _window.root;
            updateFrameSize(_window.node);
            this._onPluginWindowCreated(_window, windowName);
            // view.onStart(); // 被 start 调用了
            // uiOpacity.opacity = view._maskOpacity;
            this._addToMgr(_window);
            _options?.callback?.(_window as any);
        });
    }

    private _removeOutWindow<T extends tnt.UIWindowBase>(clazz: GConstructor<T> | string) {
        let name: string = this._getClassName(clazz);
        let isTop = true;
        while (this._stack.length) {
            let top = this._stack[this._stack.length - 1];
            let topName: string = this._getClassName(top);
            if (topName === name) {
                if (!isTop) {
                    this._playActiveAnimation(top, true);
                }
                break;
            }
            isTop = false;
            this._stack.pop();
            this._activeTop(top); // TODO 可以优化
            top._unregisterClickClose();
            this._playCloseAnimation(top, null, false);
            this._removeCurUI(top);
        }

    }

    /**
     * 关闭指定窗口
     * @param clazz 
     */
    public closeWindow<T extends tnt.UIWindowBase>(clazz?: T | GConstructor<T> | string) {
        if (!clazz) {
            if (!this._stack.length) {
                return false;
            }
            clazz = this._stack[this._stack.length - 1] as T;
        }
        let window: tnt.UIWindowBase = null;
        if (typeof clazz !== 'object') {
            // 查找第一个此名字的弹窗
            window = this.getWindow(clazz);
        } else {
            // 精准的知道关闭哪一个弹窗
            window = clazz;
        }
        this._removeFromMgr(window);
        return true;
    }

    /** 在跳转界面的时候需要调用 */
    public closeAllWindow() {
        for (const key in this._currentShowUI) {
            const array = this._currentShowUI[key];
            for (let i = 0; i < array.length; i++) {
                const view = array[i];
                if (view && view.node) {
                    let windowName = this._getClassName(view);
                    this._onPluginsWindowBeClean(view, windowName);
                    view._unregisterClickClose();

                    this.destroyUI(view);
                }
            }
            array.length = 0;
            delete this._currentShowUI[key];
        }
        this._stack.length = 0;
        // this.isShowViewing = false;
        this.emit(this.Event.All_VIEW_CLOSED);
    }

    private _addToMgr(window: tnt.UIWindowBase) {
        this._pushUI(window);
    }
    private _removeFromMgr(window: tnt.UIWindowBase) {
        window._unregisterClickClose();
        this._popUI(window);
    }

    private _pushUI(window: tnt.UIWindowBase) {
        let hideArray: tnt.UIWindowBase[] = [];
        windowIsHideOtherWindows.set(window, window._isHideOtherWindows);
        if (this._stack.length > 0) {
            let topWindow = this._stack[this._stack.length - 1];
            topWindow.onFreeze?.();
            topWindow?.playHideMask(0);

            /**
             * 1. UIWindow 为界限，如果新显示的 window 为 UIWindow，则向上查找隐藏掉这中间的所有 window 
             * 2. 如果新显示的 window 为其他，则判断变量【_isHideOtherWindows】，如果为 true，则其他所有弹窗执行冻结动画，
             * 
             **/

            for (let i = this._stack.length; i--;) {
                let _window = this._stack[i];
                let needHide = false;
                // 收集需要隐藏的弹窗
                if (window instanceof tnt.UIWindow || window._isHideOtherWindows) {
                    if (window instanceof tnt.UIPopup && _window instanceof tnt.UIWindow) {
                    } else {
                        hideArray.push(_window);
                        needHide = true;
                    }
                }

                if (needHide) {
                    let count = windowFrozenCount.get(_window) || 0;
                    let controlWindows = windowFrozenMap.get(window) || [];
                    controlWindows.push(_window);
                    windowFrozenMap.set(window, controlWindows);
                    count++;
                    windowFrozenCount.set(_window, count);
                }

                // 执行到上一个 UIWindow 停止执行
                if (window instanceof tnt.UIWindow && _window instanceof tnt.UIWindow) {
                    break;
                }
            }

            if (window._isHideOtherWindows) {
                for (let j = 0; j < hideArray.length; j++) {
                    const element = hideArray[j];
                    // element?.playHideMask();
                    this._playFreezeAnimation(element);
                }
                hideArray.length = 0;
            }
            // topWindow?.playHideMask();
            // if (window._isHideOtherWindows) {
            //     this._playFreezeAnimation(topWindow);
            // }
        }

        let name = this._getClassName(window);
        this._pushCurUI(name, window);
        this._stack.push(window);
        this._playShowAnimation(window, () => {
            for (let j = 0; j < hideArray.length; j++) {
                const element = hideArray[j];
                element.root.active = false;
            }
        });
    }

    /** 激活顶部弹窗 */
    private _activeTop(removedWindow: tnt.UIWindowBase) {

        if (this._stack.length) {
            let topWindow = this._stack[this._stack.length - 1];

            windowFrozenCount.set(topWindow, 0);
            topWindow.playShowMask(0);
            this._playActiveAnimation(topWindow, true);

            let controlWindows = windowFrozenMap.get(removedWindow) || [];
            for (let i = 0; i < controlWindows.length; i++) {
                const _window = controlWindows[i];
                if (topWindow == _window) {
                    continue;
                }
                let isHideOtherWindows = windowIsHideOtherWindows.get(removedWindow) || false;
                console.log(`UIMgr-> ${_window.name} 被 ${removedWindow.name} 控制，属于 UIWindow: ${removedWindow instanceof tnt.UIWindow}，isHideOtherWindows: ${isHideOtherWindows}`);
                if (removedWindow instanceof tnt.UIWindow || isHideOtherWindows) {
                    if (windowFrozenCount.has(_window)) {
                        let count = windowFrozenCount.get(_window);
                        count--;
                        // console.log(`UIMgr-> 冻结计数：${count}`);
                        if (count <= 0) {
                            _window.playShowMask(0);
                            // 播放显示动画或直接显示
                            isHideOtherWindows ? this._playActiveAnimation(_window, false) : _window.root.active = true;
                        }
                        windowFrozenCount.set(_window, count);
                    }
                }
            }

            // for (let i = this._stack.length; i--;) {
            //     let _window = this._stack[i];
            //     let isTop = i == this._stack.length - 1;

            //     // if (controlWindow !== removedWindow) {
            //     //     if (isTop) {
            //     //         _window.playShowMask(0);
            //     //         this._playActiveAnimation(_window, true)
            //     //     }
            //     //     continue;
            //     // }
            //     // let isHideOtherWindows = windowIsHideOtherWindows.get(controlWindow) || false;
            //     // // console.log(`UIMgr-> ${_window.name} 被 ${controlWindow.name} 控制，属于 UIWindow: ${controlWindow instanceof tnt.UIWindow}，isHideOtherWindows: ${isHideOtherWindows}`);
            //     // if (controlWindow instanceof tnt.UIWindow || isHideOtherWindows) {
            //     //     if (windowFrozenCount.has(_window)) {
            //     //         let count = windowFrozenCount.get(_window);
            //     //         count--;
            //     //         // console.log(`UIMgr-> 冻结计数：${count}`);
            //     //         if (count == 0) {
            //     //             isTop && _window.playShowMask(0);
            //     //             // 播放显示动画或直接显示
            //     //             isHideOtherWindows ? this._playActiveAnimation(_window, isTop) : _window.root.active = true;
            //     //         }
            //     //         windowFrozenCount.set(_window, count);
            //     //     }
            //     // }

            //     // if (controlWindow instanceof tnt.UIWindow && _window instanceof tnt.UIWindow) {
            //     //     break;
            //     // }
            // }
        }
    }
    private _popUI<T extends tnt.UIWindowBase>(param: string | GConstructor<T> | T = null): tnt.UIWindowBase<any> {
        let removedWindow: tnt.UIWindowBase = null;
        let _activeTopWindow: Runnable1<tnt.UIWindowBase> = null;
        if (param) {
            let window: tnt.UIWindowBase = null;
            if (typeof param !== 'object') {
                // 查找第一个此名字的弹窗
                window = this.getWindow(param);
            } else {
                // 精准的知道关闭哪一个弹窗
                window = param;
            }


            let windowName = this._getClassName(param);
            if (!window || !(windowName in this._currentShowUI)) {
                console.warn(`UIMgr-> ${windowName} 不在当前显示列表`);
                return null;
            }
            removedWindow = window;

            var index = this._stack.indexOf(window);
            if (index === this._stack.length - 1) {
                this._stack.splice(index, 1);
                // activeTop();
                _activeTopWindow = this._activeTop.bind(this);
            } else {
                this._stack.splice(index, 1);
                // 因为删除的是中间弹窗，所以不用激活顶部弹窗
            }
        } else {
            removedWindow = this._stack.pop();
            // activeTop();
            _activeTopWindow = this._activeTop.bind(this);
        }


        _activeTopWindow?.(removedWindow);
        this._playCloseAnimation(removedWindow, () => {
        });
        this._removeCurUI(removedWindow);
        return removedWindow;
    }

    private _pushCurUI(name: string, view: tnt.UIWindowBase) {
        if (!this._currentShowUI[name]) {
            this._currentShowUI[name] = [];
        }

        this._currentShowUI[name].push(view);
    }
    private _removeCurUI(window: tnt.UIWindowBase) {
        let name = this._getClassName(window);
        if (!this._currentShowUI[name]) {
            return;
        }

        this._removeElement(this._currentShowUI[name], window);
        if (this._currentShowUI[name].length == 0) {
            delete this._currentShowUI[name]; //
        }

        if (Object.keys(this._currentShowUI).length == 0) {
            this.emit(this.Event.All_VIEW_CLOSED);
        }
    }

    private _removeElement(array: Array<any>, element: any) {
        var index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }
        return false;
    }


    private _playShowAnimation(window: tnt.UIWindowBase, callback: Runnable) {
        let windowName = this._getClassName(window);
        window.playShowMask(0);

        this._onPluginsWindowShowBefore(window, windowName);
        this.emit(this.Event.WILL_SHOW_VIEW, windowName);

        let showEndFunc = () => {

            window.onActiveAfter();
            window.onShowCallback();
            window._exeShowListeners();
            window._registerAutoClose();
            window._registerClickClose();
            this._onPluginsWindowShowAfter(window, windowName);
            this.emit(this.Event.SHOWN_VIEW, windowName);
            callback?.();
            this.closeBlockInput();
        }


        window.onActive();
        window.playShowAnimation(ACTION_TAG, showEndFunc.bind(this));
    }

    private _playCloseAnimation(view: tnt.UIWindowBase, callback?: Runnable, useAnimation = true) {
        this.showBlockInput();
        let windowName = this._getClassName(view);

        view._exeWillCloseListeners();
        this.emit(this.Event.WILL_CLOSE_VIEW, windowName);

        let closeEndFunc = () => {

            callback?.();
            view.onCloseCallback();
            view._exeCloseListeners();

            this._onPluginsWindowClose(view, windowName);

            this.destroyUI(view);

            this.emit(this.Event.CLOSED_VIEW, windowName);
            this.closeBlockInput();
            view = null;
        }
        if (useAnimation) {
            view.playHideMask(0);
            view.playCloseAnimation(ACTION_TAG, closeEndFunc.bind(this));
        } else {
            view.playHideMask(0);
            closeEndFunc();
        }
    }

    public destroyUI(view: tnt.UIWindowBase) {
        let prefabUrl = view.prefabUrl as any;
        let bundle = view.bundle as any;

        if (typeof prefabUrl == 'function') {
            prefabUrl = prefabUrl(view.options);
        }

        if (typeof bundle == 'function') {
            bundle = bundle(view.options);
        }


        let isReleaseWindowPrefab = view._isReleaseWindowPrefab;

        if (view.mask) {
            view.mask.removeFromParent();
            this.maskLayerController.onWindowDestroy(view, view.mask);
        }
        rootNodePool.put(view.root);
        view.onDestroyWindow();
        view.destroy();
        view.node.destroy();

        if (isReleaseWindowPrefab) {
            this.loader.releaseAsset(prefabUrl, Prefab, bundle);
        }
        // 释放弹窗所加载的资源
        tnt.loaderMgr.releaseLoader(view.loaderKey);

        let windowName = this._getClassName(view);
        this._onPluginsWindowDestroy(view, windowName);

        // 销毁弹窗图集
        // @ts-ignore
        dynamicAtlasManager.destroyWindowAtlas?.(view.loaderKey);
    }


    private _playFreezeAnimation(window: tnt.UIWindowBase) {
        // let windowName = this.getClassName(window);
        let closeEndFunc = () => {
            window.root.active = false;
        }

        window.playFreezeAnimation(ACTION_TAG, closeEndFunc.bind(this));
    }
    private _playActiveAnimation(window: tnt.UIWindowBase, isReal = false) {
        if (!window) {
            return;
        }
        if (isReal) {
            window.onActive();
            window.playShowMask(0);
        }

        let showEndFunc = () => {
            if (isReal) {
                window.onActiveAfter();
            }
        }
        if (!window.root.active) {
            window.root.active = true;
            window.playActiveAnimation(ACTION_TAG, showEndFunc.bind(this));
        } else {
            showEndFunc();
        }
    }

    public showBlockInput() {
        this.uiBlockInput && (this.uiBlockInput.active = true);
    }
    public closeBlockInput() {
        this.uiBlockInput && (this.uiBlockInput.active = false);
    }

    public isShowing<T extends tnt.UIWindowBase>(clazz: GConstructor<T> | string): boolean {
        let name: string = this._getClassName(clazz);
        if (!name) {
            return false;
        }
        if (name in this._currentShowUI) {
            return true;
        }
        return false;
    }

    public getWindow<T extends tnt.UIWindowBase>(clazz: GConstructor<T> | string | T): tnt.UIWindowBase<any> {
        if (typeof clazz === 'object') {
            return clazz;
        }
        let name: string = this._getClassName(clazz);
        if (!name) {
            return null;
        }
        if (name in this._currentShowUI) {
            let arr = this._currentShowUI[name];
            return arr[arr.length - 1];
        }

        return null;
    }

    public _getClassName<T extends tnt.UIWindowBase>(clazz: GConstructor<T> | Object | string): string {
        let name: string = "";
        if (typeof clazz == 'string') {
            name = clazz;
        } else {
            name = js.getClassName(clazz);
        }
        return name;
    }

    /** 获取栈顶窗口 */
    public getTopWindow() {
        return this._stack[this._stack.length - 1];
    }

    /** 暂存的数据 */
    private _stageWindows: Array<StageWindow> = [];

    /** 跳转场景时 暂存当前一部分数据 
     * 原理：直接暂存 整个 弹窗栈， 在切换回场景的时候 恢复 整个弹窗栈
    */
    _stageState(currentScene: string, nextScene: string) {
        let cacheStageWindow = this._stageWindows.find((stageData) => {
            return stageData.newScene === nextScene && stageData.oldScene === currentScene;
        });
        if (cacheStageWindow) {
            // 如果有缓存，则销毁之前的弹窗
            for (let i = 0; i < cacheStageWindow.stack.length; i++) {
                const _window = cacheStageWindow.stack[i];
                this.destroyUI(_window);
            }

            js.array.remove(this._stageWindows, cacheStageWindow);
        }

        if (!this._stack.length) {
            return;
        }
        let stageWindow: StageWindow = {
            oldScene: currentScene,
            newScene: nextScene,
            stack: this._stack,
            currentShowUI: this._currentShowUI,
        }
        for (let i = 0; i < this._stack.length; i++) {
            const _window = this._stack[i];
            // let data = _window.stageState();
            // 只对最顶层弹窗进行冻结，其他在之前已冻结
            if (i === this._stack.length - 1) {
                _window.onFreeze();
            }
            _window.root.removeFromParent();
        }
        this._stack = [];
        this._currentShowUI = {};

        this._stageWindows.push(stageWindow);
    }

    /** 恢复暂存的数据 */
    public _recoverStaged(currentScene: string, lastScene: string) {
        let stageWindow = this._stageWindows.find((stageData) => {
            return stageData.newScene === lastScene && stageData.oldScene === currentScene;
        });
        if (!stageWindow) {
            return;
        }
        this._stack = stageWindow.stack;
        this._currentShowUI = stageWindow.currentShowUI;
        for (let i = 0; i < this._stack.length; i++) {
            const _window = this._stack[i];
            _window.root.parent = this.windowRoot;
            // 只恢复顶层弹窗
            if (i === this._stack.length - 1) {
                _window.onActive();
                _window.onActiveAfter();
            }
        }

        // for (let i = 0; i < stageWindow.windows.length; i++) {
        //     const _windowData = stageWindow.windows[i];
        //     this.showWindow(js.getClassByName(_windowData.clazz) as any,_windowData.options,(_window)=>{
        //         _window.recoverStaged(_windowData.data);
        //     });   
        // }
        js.array.remove(this._stageWindows, stageWindow);
    }

    /** 清空暂存数据 */
    public cleanStageState() {
        this._stageWindows.length = 0;
    }


    public async showDebugToast(msg: string) {
        if (!DEBUG) {
            return;
        }
        const TWEEN_TAG = 99;
        let toastUI = find("Canvas/ToastRoot");
        if (!toastUI) {
            let Canvas = find("Canvas");
            toastUI = new Node();
            toastUI.parent = Canvas;
            toastUI.name = "ToastRoot";
            updateFrameSize(toastUI);
            toastUI.layer = Layers.Enum.UI_2D;
            toastUI.setSiblingIndex(999);
        }
        let uiTransform = toastUI.getComponent(UITransform);


        let height = 32;
        let y = -uiTransform.height * 0.5 + height;

        for (let i = 0; i < toastUI.children.length; i++) {
            const child = toastUI.children[i];
            Tween.stopAllByTag(TWEEN_TAG, child);
            let end = y + height * (toastUI.children.length - i + 1);
            tween(child).to(0.25, { position: v3(child.position.x, end) }).tag(TWEEN_TAG).start();
        }

        let node = new Node();
        node.parent = toastUI;
        let label = node.addComponent(Label);
        let nodeTransform = node.addComponent(UITransform);
        let nodeOpacity = node.addComponent(UIOpacity);
        node.layer = Layers.Enum.UI_2D;

        label.string = msg;
        label.fontSize = 32;
        label.lineHeight = label.fontSize;
        label.updateRenderData(true);
        nodeOpacity.opacity = 1;

        await new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            });
        });
        nodeTransform.height = height;


        let x = uiTransform.width * 0.5 - nodeTransform.width * 0.5 - 10;

        node.position = v3(x, y);
        tween(node).tag(TWEEN_TAG).to(0.3, { position: v3(x, y + nodeTransform.height) }).start();
        tween(nodeOpacity).to(0.3, { opacity: 255 }).delay(3).to(0.3, { opacity: 0 }).call(() => {
            node.destroy();
        }).start();
    }

    public getUIWindowRoot() {
        let uiRoot = find("Canvas/UIRoot/WindowRoot");
        if (!uiRoot) {
            error("Canvas/UIRoot/WindowRoot not be find");
            return null;
        }
        return uiRoot;
    }
    public getUIBlockInput() {
        let uiRoot = find("Canvas/UIRoot/UIBlockInput");
        if (!uiRoot) {
            error("Canvas/UIRoot/UIBlockInput not be find");
            return null;
        }
        return uiRoot;
    }

    /** 获取超类 */
    public getSuperWindow(clazz: GConstructor<tnt.UIWindowBase>): GConstructor {
        let superClass = js.getSuper(clazz);
        while (superClass != null) {
            if (superClass == tnt.UIWindow || superClass == tnt.UIPopup) {
                break;
            }
            superClass = js.getSuper(superClass);
        }
        return superClass;
    }
    private _onUIMgrReInit() {
        UIMgr.___plugins.forEach((listener) => {
            listener.onUIMgrReInit();
        });
    }

    private _onPluginWindowCreated(view: tnt.UIWindowBase, name: string) {
        UIMgr.___plugins.forEach((listener) => {
            listener.onWindowCreated?.(view, name);
        });
    }

    private _onPluginsWindowShowBefore(view: tnt.UIWindowBase, name: string) {
        UIMgr.___plugins.forEach((listener) => {
            listener.onWindowShowBefore?.(view, name);
        });
    }

    private _onPluginsWindowShowAfter(view: tnt.UIWindowBase, name: string) {
        UIMgr.___plugins.forEach((listener) => {
            listener.onWindowShowAfter?.(view, name);
        });
    }

    private _onPluginsWindowClose(view: tnt.UIWindowBase, name: string) {
        UIMgr.___plugins.forEach((listener) => {
            listener.onWindowClose?.(view, name);
        });
    }
    private _onPluginsWindowBeClean(view: tnt.UIWindowBase, name: string) {
        UIMgr.___plugins.forEach((listener) => {
            listener.onBeClean?.(view, name);
        });
    }

    private _onPluginsWindowDestroy(view: tnt.UIWindowBase, name: string) {
        UIMgr.___plugins.forEach((listener) => {
            listener.onWindowDestroy?.(view, name);
        });
    }

    registerPlugin?(plugins: IUIMgrPlugin | IUIMgrPlugin[]);
    unregisterPlugin?(plugin: IUIMgrPlugin | string);

    private static _instance: UIMgr = null
    public static getInstance(): UIMgr {
        if (!this._instance) {
            this._instance = new UIMgr();
        }
        return this._instance;
    }
}


class DefaultMaskLayerController implements IMaskLayerController {
    onUIMgrInitialize() {

    }
    onWindowCreateBefore(windowName: string) {
        let clazz = js.getClassByName(windowName);
        let superClass = tnt.uiMgr.getSuperWindow(clazz as any);
        if (superClass instanceof tnt.UIWindow) {
            return;
        }
        // ...
        // ...
    }
    onWindowCreateAfter(view: tnt.UIWindowBase<any>): Node {
        if (view instanceof tnt.UIWindow) {
            return null;
        }
        return maskNodePool.get();
    }
    onWindowDestroy(view: tnt.UIWindowBase<any>, mask: Node) {
        if (mask) {
            maskNodePool.put(mask);
        }
    }
}

tnt.uiMgr = UIMgr.getInstance();
export { };