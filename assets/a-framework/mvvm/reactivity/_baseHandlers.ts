import { hasChanged, hasOwn, hasOwnProperty, isArray, isIntegerKey, isObject, isSymbol } from "../VMGeneral";
import { rawDepsMap, rawNameMap, rawMap, TriggerOpTypes } from "./_internals";
import { _trigger } from "./_reaction";
import { _reactive } from "./_reactive";


const arrayMethods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

const builtInSymbols = new Set(
    Object.getOwnPropertyNames(Symbol)
        // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
        // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
        // function
        .filter(key => key !== 'arguments' && key !== 'caller')
        .map(key => (Symbol as any)[key])
        .filter(isSymbol)
)

const arrayInstrumentations = createArrayInstrumentations()

function createArrayInstrumentations() {
    const instrumentations: Record<string, Function> = {}
    arrayMethods.forEach(key => {
        instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
            const raw = rawMap.get(this);
            const dep = rawDepsMap.get(raw);
            const name = rawNameMap.get(raw);

            let oldValue = this.slice();
            const proto: any = Reflect.getPrototypeOf(this);
            const result = proto[key].apply(this, args);


            // console.log(`collections->${key} `, result, "oldValue", oldValue, "newValue", this);

            _trigger(dep, TriggerOpTypes.SET, name, this, oldValue);
            return result
        }
    })
    return instrumentations
}

function get(target, key: PropertyKey, receiver?: any) {

    const targetIsArray = isArray(target);
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
    }

    const res = Reflect.get(target, key, receiver);

    if (isSymbol(key) && builtInSymbols.has(key)) {
        return res;
    }
    if (isObject(res)) {
        rawDepsMap.set(res as object, target);
        rawNameMap.set(res as object, key);
        // console.log(`_mvvm->【读取】${String(key)} 值为 ${res?.toString()} 注册代理`);
        return _reactive(res as object);
    }

    return res;
}
function set(target, key: PropertyKey, newValue, receiver?: any) {
    let oldValue = target[key];
    // console.log(`_mvvm-> set `, key, " newValue: ", newValue, "oldValue: ", oldValue);
    const _isObject = isObject(newValue);
    const _isArray = isArray(target);
    const hadKey = _isArray && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
    const res = Reflect.set(target, key, newValue, receiver);
    if (!hadKey) {
        if (_isObject) {
            rawDepsMap.set(newValue as object, target);
            rawNameMap.set(newValue as object, key);
        }
        _trigger(target, TriggerOpTypes.ADD, key, newValue, oldValue);
    } else if (hasChanged(newValue, oldValue)) {
        // TODO：对数组进行特殊处理 length
        if (_isArray && key === 'length') {

        }
        _trigger(target, TriggerOpTypes.SET, key, newValue, oldValue);
    }

    // console.log(`_mvvm-> 【设置】${String(key)} 值为： ${newValue}`);
    return res;
}
function ownKeys(target) {
    return Reflect.ownKeys(target);
}
function deleteProperty(target, key: PropertyKey) {
    // console.log(`_mvvm-> 【删除】${String(key)}`);
    const hadKey = hasOwn(target, key)
    const oldValue = (target as any)[key]
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
        _trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
    }
    return result;
}


export const baseHandlers = {
    get,
    set,
    ownKeys,
    deleteProperty,
}