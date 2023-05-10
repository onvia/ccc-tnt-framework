

declare global {
    interface ITNT {
        math: GMathf;
    }
}

class GMathf {
    private seed = 51;

    /**
     * 设置随机数种子
     *
     * @param {*} seed
     * @memberof GMathf
     */
    public setRandomSeed(seed) {
        this.seed = seed;
    }

    /**
     * 随机数
     *
     * @param {number} [max=1]
     * @param {number} [min=0]
     * @return {*} 
     * @memberof GMathf
     */
    public seedRandom(max = 1, min = 0) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        let rnd = this.seed / 233280.0;
        return min + rnd * (max - min);
    }
    /**
     * 生成 uuid
     *
     * @return {*} 
     * @memberof GMathf
     */
    public generateUUID() {
        let now = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            now += performance.now();
        }
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (now + Math.random() * 16) % 16 | 0;
            now = Math.floor(now / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }


    private static _instance: GMathf = null
    public static getInstance(): GMathf {
        if (!this._instance) {
            this._instance = new GMathf();
        }
        return this._instance;
    }
}
tnt.math = GMathf.getInstance();
export { };
