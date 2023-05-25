
export const _isArray = Array.isArray;
export const _isObject = (val) => val !== null && typeof val === "object";
export const _isString = (val: unknown): val is string => typeof val === 'string';
export const _isIntegerKey = (key: unknown) => _isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
export const _hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const _hasOwnProperty = Object.prototype.hasOwnProperty;
export const _hasOwn = (val: object, key: PropertyKey): key is keyof typeof val => _hasOwnProperty.call(val, key);


