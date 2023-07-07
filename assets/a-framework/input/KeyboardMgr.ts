import { Game, game, input, Input, KeyCode } from "cc";

declare global {
    interface ITNT {
        keyboard: KeyboardMgr;
    }
}
export class KeyboardMgr {
    private keyBordHandler: IKeyboard[] = [];
    private _downKeyList = [];
    private static _keyboard: KeyboardMgr = null;
    private _ctrlKeys = [KeyCode.CTRL_LEFT, KeyCode.SHIFT_LEFT, KeyCode.ALT_LEFT];

    // 是否启用组合键
    public enableCombination = false;

    constructor() {
        game.on(Game.EVENT_HIDE, () => {
            this._downKeyList.length = 0;
        });
    }
    public static getInstance(): KeyboardMgr {
        if (!this._keyboard) {
            this._keyboard = new KeyboardMgr();
        }
        return this._keyboard;
    }

    public on(target: IKeyboard) {
        this._KeyBordEvent(true);

        // 防止重复注册同一事件
        let findPlugin = this.keyBordHandler.find(item => item === target);
        if (findPlugin) {
            return;
        }
        this.keyBordHandler.push(target);
    }
    public off(target: IKeyboard) {

        var index = this.keyBordHandler.indexOf(target);
        if (index > -1) {
            this.keyBordHandler.splice(index, 1);
        }
        this._KeyBordEvent(false);
    }
    private _KeyBordEvent(on) {
        const eventTypes = [
            Input.EventType.KEY_DOWN,
            Input.EventType.KEY_UP,
            Input.EventType.KEY_PRESSING,
        ];

        const eventfuncs = [
            this._onKeyDown,
            this._onKeyUp,
            this._onKeyPressing,
        ];

        if (this.keyBordHandler.length === 0 && on) { //只注册一次事件
            eventfuncs.forEach((eventfunc, index) => {
                input.on(eventTypes[index], eventfunc, this);
            });
        }

        if (this.keyBordHandler.length === 0 && !on) { //反注册
            eventfuncs.forEach((eventfunc, index) => {
                input.off(eventTypes[index], eventfunc, this);
            });
        }

    }
    private _onKeyDown(event) {
        if (this._downKeyList.indexOf(event.keyCode) === -1) {
            this._downKeyList.push(event.keyCode);
        }

        if (this.enableCombination) {
            // 检查组合键
            for (let i = 0; i < this._ctrlKeys.length; i++) {
                const ctrlKey = this._ctrlKeys[i];
                if (ctrlKey === event.keyCode) {
                    continue;
                }
                // 有摁下的 控制键
                if (this._downKeyList.indexOf(ctrlKey) !== -1) {


                    this.keyBordHandler.forEach((target, index) => {
                        target.onKeyCombination?.call(target, ctrlKey, event.keyCode);
                    });
                    return;
                }
            }
        }

        this.keyBordHandler.forEach((target, index) => {
            target.onKeyDown?.call(target, event);
            if (event.keyCode === KeyCode.ESCAPE || event.keyCode === KeyCode.MOBILE_BACK) {
                target.onKeyBack?.call(target, event);
            }
        });
    }

    private _onKeyUp(event) {
        var index = this._downKeyList.indexOf(event.keyCode);
        if (index != -1) {
            if (index > -1) {
                this._downKeyList.splice(index, 1);
            }
        }
        this.keyBordHandler.forEach((target, index) => {
            target.onKeyUp?.call(target, event);
        });
    };

    private _onKeyPressing(event) {

        if (this.enableCombination) {
            // 检查组合键
            for (let i = 0; i < this._ctrlKeys.length; i++) {
                const ctrlKey = this._ctrlKeys[i];
                if (ctrlKey === event.keyCode) {
                    continue;
                }
                // 有摁下的 控制键  组合键长摁
                if (this._downKeyList.indexOf(ctrlKey) !== -1) {
                    this.keyBordHandler.forEach((target, index) => {
                        target.onKeyCombinationPressing?.call(target, ctrlKey, event.keyCode);
                    });
                    return;
                }
            }
        }

        this.keyBordHandler.forEach((target, index) => {
            target.onKeyPressing?.call(target, event);
        });
    }
}
tnt.keyboard = KeyboardMgr.getInstance();