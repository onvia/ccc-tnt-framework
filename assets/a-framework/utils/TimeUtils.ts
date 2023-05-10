declare global {
    interface ITNT {
        timeUtils: GTimeUtils;
    }
}

class GTimeUtils {

    now(): number {
        if (Date.now) {
            return Date.now();
        } else {
            return +new Date();
        }
    }
    nowSecond() {
        if (Date.now) {
            return Math.floor(Date.now() / 1000);
        } else {
            return Math.floor((new Date().getTime()) / 1000);
        }
    }
    /** 间隔天数 */
    daysBetween(time1: number | string | Date, time2: number | string | Date): number {
        if (time2 == undefined || time2 == null) {
            time2 = +new Date();
        }
        let startDate = new Date(time1).toLocaleDateString()
        let endDate = new Date(time2).toLocaleDateString()
        var startTime = new Date(startDate).getTime();
        var endTime = new Date(endDate).getTime();
        var dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
        return dates;
    }

    /** 间隔秒数 */
    secsBetween(time1: number, time2: number) {
        if (time2 == undefined || time2 == null) {
            time2 = +new Date();
        }
        var dates = Math.abs((time2 - time1)) / (1000);
        return dates;
    }

    async sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms)
        });
    }

    private static _instance: GTimeUtils = null
    public static getInstance(): GTimeUtils {
        if (!this._instance) {
            this._instance = new GTimeUtils();
        }
        return this._instance;
    }
}

tnt.timeUtils = GTimeUtils.getInstance()
export { };