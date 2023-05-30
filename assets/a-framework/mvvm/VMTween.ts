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
    newValue: number;
    oldValue: number;
    targetValue: number;
    value: number;
}

// 数字滚动
export class GVMTween implements IVMTween {

    datas: Record<string, VMTweenData> = null;
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

        if (!this.check(newValue)) {
            resolve(newValue, oldValue, path);
            return;
        }

        this.initDatas(newValue,oldValue,path);

        let data = this.datas[path];
        if (data) {
            Tween.stopAllByTarget(data);
        } else {
            data = new VMTweenData();
            this.datas[path] = data;
        }

        data.newValue = oldValue;
        data.oldValue = oldValue;
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
                data.newValue = current;
                resolve(data.newValue, data.oldValue, path);
                data.oldValue = current;
                return current;
            }
        }).start();
    }

    onTransitionArray(newValue: any[], oldValue: any[], watchPaths: any[], resolve: VMTweenValueResults) {
        let self = this;
        if (newValue.length != oldValue.length) {
            error(`VMTween-> 数据错误`);
            return;
        }
        let idx = newValue.findIndex((value, index) => {
            return oldValue[index] != value;
        });

        if (!this.check(newValue[idx])) {
            resolve(newValue, oldValue, watchPaths);
            return;
        }

        this.initDatas(newValue,oldValue,watchPaths);

        let path = watchPaths[idx];
        let data = this.datas[`${path}.${idx}`];
        if (data) {
            Tween.stopAllByTarget(data);
        } else {
            data = new VMTweenData();
            this.datas[`${path}.${idx}`] = data;
        }
        data.newValue = oldValue[idx];
        data.oldValue = oldValue[idx];
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
                data.newValue = current;
                let { newValue: __newValue, oldValue: __oldValue } = self.getValue4Array();
                resolve(__newValue, __oldValue, watchPaths);
                data.oldValue = current;
                return current;
            }
        }).start();
    }

    initDatas(newValue,oldValue,path: string | string[]){
        if(this.datas !== null){
            return;
        }
        this.datas = {};
        if(Array.isArray(path)){
            for (let i = 0; i < path.length; i++) {
                const element = path[i];
                let data = new VMTweenData();
                
                data.newValue = oldValue[i];
                data.oldValue = oldValue[i];
                data.value = oldValue[i];
                data.targetValue = newValue[i];
                
                this.datas[`${element}.${i}`] = data;
            }
            return;
        }
        let data = new VMTweenData();
        data.newValue = oldValue;
        data.oldValue = oldValue;
        data.value = oldValue;
        data.targetValue = newValue;
        this.datas[path] = data;
    }
    getValue4Array() {
        let newValue = [];
        let oldValue = [];
        for (const key in this.datas) {
            let keyArr = key.split(".");
            let idx = parseInt(keyArr[keyArr.length - 1]);
            newValue[idx] = this.datas[key].newValue;
            oldValue[idx] = this.datas[key].oldValue;
        }
        return { newValue, oldValue };
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