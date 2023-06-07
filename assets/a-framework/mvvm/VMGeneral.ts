
export const isArray = Array.isArray;
export const isObject = (val) => val !== null && typeof val === "object";
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isMap = (val: unknown): val is Map<any, any> => toTypeString(val) === '[object Map]';
export const isSet = (val: unknown): val is Set<any> => toTypeString(val) === '[object Set]';
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const toTypeString = (value: unknown): string => objectToString.call(value);
export const objectToString = Object.prototype.toString;

export const toRawType = (value: unknown): string => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1)
}

export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isIntegerKey = (key: unknown) => isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: PropertyKey): key is keyof typeof val => hasOwnProperty.call(val, key);


