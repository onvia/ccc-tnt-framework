
export const isArray = Array.isArray;
export const isObject = (val) => val !== null && typeof val === "object";
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isIntegerKey = (key: unknown) => isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue);

export const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val: object, key: PropertyKey): key is keyof typeof val => hasOwnProperty.call(val, key);


