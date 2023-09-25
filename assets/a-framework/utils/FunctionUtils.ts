declare global {
    interface ITNT {
        functionUtils: FunctionUtils;
    }
}

class FunctionUtils {

    /** 防抖函数 */
    debounce(func: Runnable, wait: number = 1 / 60 * 1000) {
        let timeout;

        return function () {
            const context = this;
            const args = arguments;

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }


    private static _instance: FunctionUtils = null
    public static getInstance(): FunctionUtils {
        if (!this._instance) {
            this._instance = new FunctionUtils();
        }
        return this._instance;
    }
}

tnt.functionUtils = FunctionUtils.getInstance();

export { };