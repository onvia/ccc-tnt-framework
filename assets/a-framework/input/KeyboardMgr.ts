import { EventKeyboard, Game, game, input, Input, KeyCode } from "cc";

declare global {
    interface ITNT {
        keyboard: KeyboardMgr;
    }
}
export class KeyboardMgr {
    private keyBoardHandler: IKeyboard[] = [];
    private _downKeyList = [];
    private static _keyboard: KeyboardMgr = null;
    private _ctrlKeys = [
        KeyCode.CTRL_LEFT, KeyCode.SHIFT_LEFT, KeyCode.ALT_LEFT,
        KeyCode.CTRL_RIGHT, KeyCode.SHIFT_RIGHT, KeyCode.ALT_RIGHT
    ];

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
        this._KeyBoardEvent(true);

        // 防止重复注册同一事件
        let findPlugin = this.keyBoardHandler.find(item => item === target);
        if (findPlugin) {
            return;
        }
        this.keyBoardHandler.push(target);
    }
    public off(target: IKeyboard) {

        var index = this.keyBoardHandler.indexOf(target);
        if (index > -1) {
            this.keyBoardHandler.splice(index, 1);
        }
        this._KeyBoardEvent(false);
    }
    private _KeyBoardEvent(on) {
        const eventTypes = [
            Input.EventType.KEY_DOWN,
            Input.EventType.KEY_UP,
            Input.EventType.KEY_PRESSING,
        ];

        const eventFuncs = [
            this._onKeyDown,
            this._onKeyUp,
            this._onKeyPressing,
        ];

        if (this.keyBoardHandler.length === 0 && on) { //只注册一次事件
            eventFuncs.forEach((eventFunc, index) => {
                input.on(eventTypes[index], eventFunc, this);
            });
        }

        if (this.keyBoardHandler.length === 0 && !on) { //反注册
            eventFuncs.forEach((eventFunc, index) => {
                input.off(eventTypes[index], eventFunc, this);
            });
        }

    }
    private _onKeyDown(event: EventKeyboard) {
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


                    this.keyBoardHandler.forEach((target, index) => {
                        target.onKeyCombination?.call(target, ctrlKey, event.keyCode);
                    });
                    return;
                }
            }
        }

        this.keyBoardHandler.forEach((target, index) => {
            target.onKeyDown?.call(target, event);
            if (event.keyCode === KeyCode.ESCAPE || event.keyCode === KeyCode.MOBILE_BACK) {
                target.onKeyBack?.call(target, event);
            }
        });
    }

    private _onKeyUp(event: EventKeyboard) {
        var index = this._downKeyList.indexOf(event.keyCode);
        if (index != -1) {
            if (index > -1) {
                this._downKeyList.splice(index, 1);
            }
        }
        this.keyBoardHandler.forEach((target, index) => {
            target.onKeyUp?.call(target, event);
        });
    };

    private _onKeyPressing(event: EventKeyboard) {

        if (this.enableCombination) {
            // 检查组合键
            for (let i = 0; i < this._ctrlKeys.length; i++) {
                const ctrlKey = this._ctrlKeys[i];
                if (ctrlKey === event.keyCode) {
                    continue;
                }
                // 有摁下的 控制键  组合键长摁
                if (this._downKeyList.indexOf(ctrlKey) !== -1) {
                    this.keyBoardHandler.forEach((target, index) => {
                        target.onKeyCombinationPressing?.call(target, ctrlKey, event.keyCode);
                    });
                    return;
                }
            }
        }

        this.keyBoardHandler.forEach((target, index) => {
            target.onKeyPressing?.call(target, event);
        });
    }

    isPressed(keyCode: KeyCode) {
        return this._downKeyList.indexOf(keyCode) != -1;
    }
}
tnt.keyboard = KeyboardMgr.getInstance();