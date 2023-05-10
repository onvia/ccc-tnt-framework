
import { CCObject, director, ISchedulable, isValid, macro, Scheduler, _decorator } from 'cc';
const { ccclass, property } = _decorator;




declare global {
    interface ITNT {
        timerMgr: TimerMgr;
    }
}

type ScheduleFn = (dt: number) => void;

interface TimerWrap {
    timerId: number;
    target: Object;
    targetCallback: ScheduleFn;
    timerCallback: ScheduleFn;
}

let __timerId = 0;
@ccclass('TimerMgr')
class TimerMgr implements ISchedulable {
    declare id?: string;
    declare uuid?: string;

    timerMap: Map<number, TimerWrap> = new Map();

    constructor(){
        Scheduler.enableForTarget(this);
    }

    public startTimer(callback: ScheduleFn, target: Object, interval = 0, repeat: number = macro.REPEAT_FOREVER, delay = 0) {
        __timerId++;
        let timerWrap: TimerWrap = {
            timerId: __timerId,
            target: target,
            targetCallback: callback,
            timerCallback: (dt: number) => {
                // 
                if(timerWrap.target instanceof CCObject && !isValid(timerWrap.target)){
                    this.removeTimer(timerWrap.timerId);
                    return;
                }
                callback.call(target, dt);
            }
        }
        this.schedule(timerWrap.timerCallback, interval, repeat, delay);
        this.timerMap.set(__timerId, timerWrap);
        return __timerId;
    }
    public startTimerOnce(callback: ScheduleFn, target: Object, delay = 0) {
        __timerId++;
        let timerWrap: TimerWrap = {
            timerId: __timerId,
            target: target,
            targetCallback: callback,
            timerCallback: (dt: number) => {
                callback.call(target, dt);
                this.timerMap.delete(timerWrap.timerId);
            }
        }
        this.scheduleOnce(timerWrap.timerCallback, delay);
        this.timerMap.set(__timerId, timerWrap);
        return __timerId;
    }

    public removeTimer(timerId: number)
    public removeTimer(callback: ScheduleFn, target?: Object)
    public removeTimer(timerIdOrCallback: number | ScheduleFn, target?: Object) {

        if (typeof timerIdOrCallback === "number") {
            if (this.timerMap.has(timerIdOrCallback)) {
                let timerWrap = this.timerMap.get(timerIdOrCallback);
                this.unschedule(timerWrap.timerCallback);
                this.timerMap.delete(timerIdOrCallback);
            }
        } else {
            let keys = this.timerMap.keys();
            let isLoop = true;
            while (isLoop) {
                let iterator = keys.next();
                let timerWrap = this.timerMap.get(iterator.value);
                if (timerIdOrCallback === timerWrap.targetCallback) {
                    if (target) {
                        if (timerWrap.target === target) {
                            isLoop = false;
                        }
                    } else {
                        isLoop = false;
                    }
                }
                if (!isLoop) {
                    this.unschedule(timerWrap.timerCallback);
                }
            }
        }

    }

    public removeTimerByTarget(target: Object) {
        let arr: TimerWrap[] = [];
        this.timerMap.forEach((val, key) => {
            if (val.target === target) {
                arr.push(val);
            }
        });

        for (let i = 0; i < arr.length; i++) {
            this.removeTimer(arr[i].timerId);
        }
        arr.length = 0;
    }

    public clear() {
        director.getScheduler().unscheduleAllForTarget(this);
        this.timerMap.clear();
    }


    private schedule(callback, interval = 0, repeat: number = macro.REPEAT_FOREVER, delay = 0) {

        interval = interval || 0;

        repeat = Number.isNaN(repeat) ? macro.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        const scheduler = director.getScheduler();

        const paused = scheduler.isTargetPaused(this);

        scheduler.schedule(callback, this, interval, repeat, delay, paused);
    }

    private scheduleOnce(callback, delay = 0) {
        this.schedule(callback, 0, 0, delay);
    }
    private unschedule(callback_fn) {
        if (!callback_fn) {
            return;
        }

        director.getScheduler().unschedule(callback_fn, this);
    }
    private static _instance: TimerMgr = null
    public static getInstance(): TimerMgr {
        if (!this._instance) {
            this._instance = new TimerMgr();
        }
        return this._instance;
    }
}

tnt.timerMgr = TimerMgr.getInstance();

export { };