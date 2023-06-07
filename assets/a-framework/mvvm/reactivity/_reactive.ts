import { isObject, toRawType } from "../VMGeneral";
import { getHandlers } from "./_handlers";
import { proxyMap, rawMap, Raw, RawType } from "./_internals";



function _targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return RawType.COMMON;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return RawType.COLLECTION;
        default:
            return RawType.INVALID;
    }
}

function _getRawType(value: Raw) {
    return !Object.isExtensible(value) ? RawType.INVALID : _targetTypeMap(toRawType(value));
}

function _reactive<T extends Raw>(raw: T): T {
    return _createReactive(raw);
}

function _createReactive<T extends Raw>(raw: T): T {
    if (rawMap.has(raw)) {
        console.warn(`_mvvm-> 本身已经是代理`);
        return raw;
    }
    if (!isObject(raw)) {
        console.warn(`_mvvm-> 非对象无法进行代理: ${String(raw)}`)
        return raw;
    }
    const existingProxy = proxyMap.get(raw);
    if (existingProxy) {
        return existingProxy as T;
    }
    const targetType = _getRawType(raw)
    if (targetType === RawType.INVALID) {
        return raw;
    }

    const proxy = new Proxy(raw, getHandlers(targetType));
    proxyMap.set(raw, proxy);
    rawMap.set(proxy, raw);
    return null;
}
export {
    _reactive
};