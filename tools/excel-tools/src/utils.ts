export enum DataType {

    NUMBER = 'number',
    STRING = 'string',
    BOOL = 'bool',
    ARRAY = 'array', // 数组内元素自动推导
    NUM_ARRAY = 'number[]', // 
    STR_ARRAY = 'string[]', // 
    BOOL_ARRAY = 'bool[]',
    OBJECT = 'object',
    AUTO = 'auto', // 自动推导
}


export function toBoolean(value: string) {
    if(typeof (value) === 'undefined'){
        return false;
    }
    let isTrue = false;
    let _case = value.toString().trim().toLowerCase();
    if (_case === 'true') {
        isTrue = true;
    } else if (_case === 'false') {
        isTrue = false;
    } else {
        console.error(`toBoolean error: [${value}]`);
    }
    return isTrue;
}

export function isNumber(value) {
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value === 'undefined' || value === null) {
        return false;
    }
    return (!isNaN(parseFloat(value)) && isFinite(value));
}

export function isBoolean(value) {
    if (typeof (value) === "undefined") {
        return false;
    }
    if (typeof value === 'boolean') {
        return true;
    }
    let b = value.toString().trim().toLowerCase();
    return b === 'true' || b === 'false';
}
export function toStringArray(data: string) {
    if (typeof (data) === "undefined") {
        return [];
    }
    let datas = data.split(",");
    datas = datas.map((res) => {
        res = res.toString().trim();
        return res.trim();
    });
    return datas;
}
export function toBoolArray(data: string) {
    if (typeof (data) === "undefined") {
        return [];
    }
    let datas = data.split(",");
    let result = datas.map((res) => {
        res = res.toString().trim();
        return toBoolean(res);
    });
    return result;
}
export function toObject(data: string) {
    let results: any = {};
    if (typeof (data) === "undefined") {
        return results;
    }
    let json = data;
    if (!data.toString().startsWith("{")) {
        json = `{${data}}`;
    }
    try {
        // 首先尝试正常的对象解析
        results = eval("(" + json + ")");
    } catch (error) {
        try {
            let datas = data.split(",");
            datas.forEach((res) => {
                let kvs = res.split(":");
                kvs.map((kv) => {
                    return kv.trim();
                });
                if (kvs.length >= 2) {
                    results[kvs[0]] = parseAuto(kvs[1]);
                }
            });
        } catch (error) {
            results = null;
        }
    }
    return results;
}

export function toArray(data: string) {
    let results: any = [];
    if (typeof (data) === "undefined") {
        return results;
    }
    let json = data;
    if (!data.toString().startsWith("[")) {
        json = `[${data}]`;
    }
    try {
        // 首先尝试正常的数组解析
        results = eval("(" + json + ")");
    } catch (error) {
        try {
            let datas = data.split(",");
            results = datas.map((res) => {
                let result = parseAuto(res);
                return result;
            });
        } catch (error) {
            results = null;
        }
    }
    return results;
}

export function parseAuto(res: string | number) {
    if (typeof (res) === "undefined") {
        return "";
    }
    res = res.toString().trim();
    let result = null;
    if (res.match(/\"|\'/g)) {
        res = res.replace(/\"|\'/g, "");
    }
    if (isNumber(res)) {
        result = Number(res);
    } else if (isBoolean(res)) {
        result = toBoolean(res);
    } else {
        // TODO 解析复杂对象，数组
        
        result = res;
    }

    
    return result;
}