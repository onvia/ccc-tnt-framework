import { error, tween, Tween } from "cc";

export type VMTweenValueResults = (newValue: any, oldValue: any, path: any) => void;

// 接口
declare global {
    interface IVMTween {
        onLoad();
        onDestroy();
        onTransition(newValue: any, oldValue: any, path: any, resolve: VMTweenValueResults);
    }
}

class VMTweenData {
    currentValue: number;
    targetValue: number;
    value: number;
}

// 数字滚动
export class GVMTween implements IVMTween {

    datas: Record<string, VMTweenData> = {};
    duration = 0.3;
    constructor(_duration?: number) {
        if (_duration != undefined) {
            this.duration = _duration;
        }
    }

    onLoad() {

    }
    onDestroy() {
        for (const key in this.datas) {
            const data = this.datas[key];
            Tween.stopAllByTarget(data);
        }
    }
    onTransition(newValue: any, oldValue: any, path: any, resolve: VMTweenValueResults) {


        if (Array.isArray(newValue) && Array.isArray(oldValue)) {
            this.onTransitionArray(newValue, oldValue, path, resolve);
            return;
        }

        if(!this.check(newValue)){
            resolve(newValue,oldValue,path);
            return;
        }

        let data = this.datas[path];
        if (data) {
            Tween.stopAllByTarget(data);
        } else {
            data = new VMTweenData();
            this.datas[path] = data;
        }


        data.currentValue = oldValue;
        data.value = oldValue;
        data.targetValue = newValue;

        let t = tween(data);
        t.to(this.duration, { value: newValue }, {
            progress(start: any, end, current, t) {
                if (newValue != end) {
                    return 0;
                }
                if (typeof start === 'number') {
                    current = start + (end - start) * t;
                }
                else {

                    start.lerp(end, t, current);
                }
                resolve(current, data.currentValue, path);
                data.currentValue = current;
                return current;
            }
        }).start();
    }

    onTransitionArray(newValue: any[], oldValue: any[], watchPaths: any[], resolve: VMTweenValueResults) {
        if (newValue.length != oldValue.length) {
            error(`VMTween-> 数据错误`);
            return;
        }
        let idx = newValue.findIndex((value, index) => {
            return oldValue[index] != value;
        });
        
        if(!this.check(newValue[idx])){
            resolve(newValue,oldValue,watchPaths);
            return;
        }

        let path = watchPaths[idx];
        let _newValue = [...newValue];
        let _oldValue = [...oldValue];
        
        let data = this.datas[`${path}.${idx}`];
        if (data) {
            Tween.stopAllByTarget(data);
        } else {
            data = new VMTweenData();
            this.datas[path] = data;
        }
        data.currentValue = oldValue[idx];
        data.value = oldValue[idx];
        data.targetValue = newValue[idx];


        let t = tween(data);
        t.to(this.duration, { value: newValue[idx] }, {
            progress(start: any, end, current, t) {
                if (newValue[idx] != end) {
                    return 0;
                }
                if (typeof start === 'number') {
                    current = start + (end - start) * t;
                }
                else {
                    start.lerp(end, t, current);
                }
                _newValue[idx] = current;
                resolve(_newValue, _oldValue, watchPaths);
                data.currentValue = current;
                _oldValue[idx] = current;
                return current;
            }
        }).start();
    }


    check(newValue) {

        let isString = typeof newValue === "string";
        if (!isString && typeof newValue !== "number") {
            return false;
        }
        if (isString) {
            // 检查是否全是数字
            let regExp = /^[+-]?\d*(\.\d*)?(e[+-]?\d+)?$/;
            if (!regExp.test(newValue)) {
                return false;
            }
        }

        return true;
    }
}