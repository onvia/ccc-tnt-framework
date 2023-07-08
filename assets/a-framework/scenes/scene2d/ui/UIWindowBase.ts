
import './UIBase';
import { _decorator, js, v3, UIOpacity, Tween, tween, easing, sys, BlockInputEvents, Button, Node, UIRenderer, dynamicAtlasManager, Sprite, Label, game, Game, Component } from "cc";
import { DEV } from "cc/env";
const { ccclass } = _decorator;


declare global {

    interface ITNT {
        UIWindowBase: typeof UIWindowBase;
    }

    namespace tnt {
        type UIWindowBase<Options = any> = InstanceType<typeof UIWindowBase<Options>>;
    }
}
@ccclass("UIWindowBase")
class UIWindowBase<Options = any> extends tnt.UIBase<Options> implements ILoaderKeyAble {

    public root: Node = null;
    public mask: Node = null;

    /** 弹窗 参数 */
    public options: Options = null;

    /** 是否隐藏其他弹窗 */
    public _isHideOtherWindows: boolean = false;

    /** 是否是唯一性弹窗 */
    public _isUniqueness: boolean = true;

    /** 点击任意位置关闭界面 */
    protected _isClickAnyWhereClose: boolean = false;
    protected _clickAnyWhereCloseCallback: Runnable = null;

    /** 蒙版透明度 */
    public _maskOpacity: number = 125;

    /** 自动关闭延时 */
    protected _autoCloseDelay: number = -1;

    /** 能否穿透蒙版点击到下层 */
    protected _isPenetrate: boolean = false;

    /** 释放弹窗预制体 */
    public _isReleaseWindowPrefab: boolean = true;

    // 是否使用图集
    useAtlas = true;

    protected _loader: tnt.AssetLoader = null;
    public get loader() {
        if (!this._loader) {
            this._loader = tnt.loaderMgr.get(this.loaderKey);
            this._loader.windowName = this.loaderKey;
        }
        return this._loader;
    }

    protected _showListeners: Runnable[] = [];
    protected _closeListeners: Runnable[] = [];
    protected _willCloseListeners: Runnable[] = [];




    //监听显示
    public addShowListener(func: Runnable) {
        this._showListeners.push(func);
    }

    //监听关闭
    public addCloseListener(func: Runnable) {
        this._closeListeners.push(func);
    }

    public addWillCloseListener(func: Runnable) {
        this._willCloseListeners.push(func);
    }

    public removeShowListener(func: Runnable) {
        var index = this._showListeners.indexOf(func);
        if (index > -1) {
            this._showListeners.splice(index, 1);
        }
    }

    public removeCloseListener(func: Runnable) {
        var index = this._closeListeners.indexOf(func);
        if (index > -1) {
            this._closeListeners.splice(index, 1);
        }
    }

    public removeWillCloseListener(func: Runnable) {
        var index = this._willCloseListeners.indexOf(func);
        if (index > -1) {
            this._willCloseListeners.splice(index, 1);
        }
    }

    _exeShowListeners() {
        for (let i = 0; i < this._showListeners.length; i++) {
            const func = this._showListeners[i];
            func();
        }
    }

    _exeWillCloseListeners() {
        for (let i = 0; i < this._willCloseListeners.length; i++) {
            const func = this._willCloseListeners[i];
            func();
        }
    }
    _exeCloseListeners() {
        for (let i = 0; i < this._closeListeners.length; i++) {
            const func = this._closeListeners[i];
            func();
        }
    }

    /**
     * 界面完整显示的回调
     *
     * @memberof UIWindowBase
     */
    onShowCallback() {

        DEV && console.log(`${js.getClassName(this)}-> onShowCallback`);
    }
    /**
     * 界面完全关闭的回调
     *
     * @memberof UIWindowBase
     */
    onCloseCallback() {
        DEV && console.log(`${js.getClassName(this)}-> onCloseCallback`);
    }

    _playShowAnimation(tag: number, callback: () => void) {
        let duration = 0.2;
        this.node.scale = v3(0.2, 0.2, 0.2);
        let uiOpacityComp = this.node.getComponent(UIOpacity);
        if (!uiOpacityComp) {
            uiOpacityComp = this.node.addComponent(UIOpacity);
        }
        uiOpacityComp.opacity = 0;

        Tween.stopAllByTag(tag, uiOpacityComp);
        Tween.stopAllByTag(tag, this.node);

        tween(uiOpacityComp).to(duration, { opacity: 255 }).tag(tag).start();
        tween(this.node).to(duration, { scale: v3(1, 1, 1) }, { easing: easing.backOut }).tag(tag).call(callback).start();
        // callback?.();
    }

    _playCloseAnimation(tag: number, callback: () => void) {
        let duration = 0.2;
        let uiOpacityComp = this.node.getComponent(UIOpacity);

        Tween.stopAllByTag(tag, uiOpacityComp);
        Tween.stopAllByTag(tag, this.node);

        tween(uiOpacityComp).to(duration, { opacity: 0 }).tag(tag).start();
        tween(this.node).to(duration, { scale: v3(0, 0, 0) }, { easing: easing.backIn }).tag(tag).call(callback).start();
        // callback?.();

    }
    _playActiveAnimation(tag: number, callback: () => void) {
        this._playShowAnimation(tag, callback);
    }
    _playFreezeAnimation(tag: number, callback: () => void) {
        this._playCloseAnimation(tag, callback);
    }
    _playShowMask(duration = 0.1) {
        if (this.mask) {
            let maskOpacity = this.mask.getComponent(UIOpacity);
            tween(maskOpacity).to(duration, { opacity: this._maskOpacity }).start();
        }

        DEV && console.log(`${js.getClassName(this)}-> ${this.uuid}  _playMaskFadeIn  ${sys.now()}`);
    }
    _playHideMask(duration = 0.2) {
        if (this.mask) {
            let maskOpacity = this.mask.getComponent(UIOpacity);
            tween(maskOpacity).to(duration, { opacity: 0 }).start();
        }

        DEV && console.log(`${js.getClassName(this)}-> ${this.uuid}  _playMaskFadeOut  ${sys.now()}`);
    }

    /**
     * 注册自动关闭
     *
     * @return {*} 
     * @memberof UIWindowBase
     */
    _registerAutoClose() {
        if (this._autoCloseDelay <= 0) {
            return;
        }
        this.scheduleOnce(() => {
            this.close();
        }, this._autoCloseDelay);
    }


    /**
     * 注册点击关闭
     *
     * @memberof UIWindowBase
     */
    _registerClickClose() {
        let mask = this.mask;
        if (!mask) {
            console.warn(`UIWindowBase->_registerClickClose mask is null`);
            return;
        }
        let blockInputEvents = mask.getComponent(BlockInputEvents);
        if (this._isClickAnyWhereClose) {
            blockInputEvents?.destroy();
            if (!mask.getComponent(Button)) {
                mask.addComponent(Button);
                mask.once("click", this.close, this);
            }
        } else {
            if (!this._isPenetrate) {
                !blockInputEvents && mask.addComponent(BlockInputEvents);
            } else {
                blockInputEvents?.destroy();
            }
        }
    }
    _unregisterClickClose() {
        if (this._isClickAnyWhereClose) {
            let button = this.mask.getComponent(Button);
            button?.destroy();
            this.mask.off("click", this.close, this);
        }
    }

    /**
     * 设置唯一性
     *
     * @param {boolean} [enable=true]
     * @memberof UIWindowBase
     */
    public setUniqueness(enable: boolean = true) {
        this._isUniqueness = enable;
    }

    /**
     * 设置隐藏其他界面，在 onCreate 方法中调用
     *
     * @param {boolean} [enable=true]
     * @memberof UIWindowBase
     */
    public setHideOtherWindows(enable: boolean = true) {
        this._isHideOtherWindows = enable;
    }

    /**
     * 设置蒙版透明度
     *
     * @param {number} [opacity=126]
     * @memberof UIWindowBase
     */
    public setMaskOpacity(opacity: number = 126) {
        this._maskOpacity = opacity;
        if (this.mask) {
            let uiOpacity = this.mask.getComponent(UIOpacity);
            uiOpacity.opacity = opacity;
        }
    }

    /**
     * 设置点击任意位置关闭
     *
     * @param {boolean} [enable=true]
     * @param {Runnable} [callback]
     * @memberof UIWindowBase
     */
    public setClickAnyWhereClose(enable: boolean = true, callback?: Runnable) {
        this._isClickAnyWhereClose = enable;
        if (this._isClickAnyWhereClose) {
            this._registerClickClose();
        } else {
            this._unregisterClickClose();
        }
        
        if (this._clickAnyWhereCloseCallback) {
            this.removeCloseListener(this._clickAnyWhereCloseCallback);
        }
        if (callback) {
            this._clickAnyWhereCloseCallback = callback;
            this.addCloseListener(this._clickAnyWhereCloseCallback);
        }
    }

    /**
     * 设置释放弹窗预制体
     *
     * @param {boolean} release
     * @memberof UIWindowBase
     */
    public setReleaseWindowPrefab(release: boolean) {
        this._isReleaseWindowPrefab = release;
    }

    /**
     * 设置自动关闭
     *
     * @param {number} [delay=3] 自动关闭延迟时间
     * @memberof UIWindowBase
     */
    public setAutoClose(delay: number = 3) {
        this._autoCloseDelay = delay;
    }

    /**
     * 设置能否穿透蒙版点击到下层
     *
     * @param {boolean} [enable=true]
     * @memberof UIWindowBase
     */
    public setPenetrate(enable: boolean = true) {
        this._isPenetrate = enable;
    }

    public close(callback?: Runnable) {
        if (callback && typeof callback === 'function') {
            this.addCloseListener(callback);
        }
        tnt.uiMgr.closeWindow(this);
    }

    /**
     * 窗口激活, 首次打开和从冻结状态激活都会被调用
     */
    onActive() {
        DEV && console.log(`${js.getClassName(this)}-> ${this.uuid}  激活`);

    }

    onActiveAfter() {

    }

    /**
     * 窗口冻结，窗口被关闭时不会被自动调用
     */
    onFreeze() {
        DEV && console.log(`${js.getClassName(this)}-> ${this.uuid}  冻结`);
    }

    /**
     * 销毁自身节点之前进行一些处理
     */
    public onDestroyWindow() {

    }

}

tnt.UIWindowBase = UIWindowBase;

export { };