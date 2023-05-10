
declare global {
    interface Array<T> {
        remove(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
        remove(filter: T): Array<T>;

        removeOne(filter: (v: T, i: number, arr: Array<T>) => boolean): Array<T>;
        removeOne(filter: T): Array<T>;

        random(): T;

        first(): T;
        last(): T;

        max(): T;
        max<P>(mapper: (v: T, i: number, arr: this) => P): P | null;

        min(): T;
        min<P>(mapper: (v: T, i: number, arr: this) => P): P | null;

        distinct(): Array<T>;
        filterIndex(filter: (v: T, i: number, arr: this) => boolean): Array<number>;

        count(filter: (v: T, i: number, arr: this) => boolean): number;
        sum(mapper?: (v: T, i: number, arr: this) => number): number;
        average(mapper?: (v: T, i: number, arr: this) => number): number;


        // 移除指定位置的元素 返回移除的元素
        fastRemoveAt(index: number): T;
        fastRemove(value: T): boolean;

        /**
         * 同find，但返回整个Array<T>中最后一个匹配元素
         */
        findLast(predicate: (value: T, index: number, obj: Array<T>) => boolean): T | undefined;
        /**
         * 同find，但返回整个Array<T>中最后一个匹配元素的index
         */
        findLastIndex(predicate: (value: T, index: number, obj: Array<T>) => boolean): number;

        //排序升序 返回新的数组
        orderBy(...mappers: ((v: T) => any)[]): Array<T>;
        // 排序 降序
        orderByDesc(...mappers: ((v: T) => any)[]): Array<T>;

        /**
         * 二分查找 前提是数组一定是有序的
         * @param value 要查找的值
         * @param keyMapper 要查找的值的mapper方法（默认为查找数组元素本身）
         * @return 查找到的index，查不到返回-1
         */
        binarySearch(value: number | string, keyMapper?: (v: T) => (number | string)): number;
        /**
         * 二分插入 前提是数组一定是有序的
         * @param item 要插入的值
         * @param keyMapper 二分查找时要查找的值的mapper方法（默认为查找数组元素本身）
         * @param unique 是否去重，如果为true，则如果数组内已经有值时不插入，返回已有值的number
         * @return 返回插入的index位置
         */
        binaryInsert(item: T, unique?: boolean): number;
        binaryInsert(item: T, keyMapper: (v: T) => (number | string), unique?: boolean): number;
        /**
         * 二分去重 前提是数组一定是有序的
         * @param keyMapper 二分查找时要查找的值的mapper方法（默认为查找数组元素本身）
         */
        binaryDistinct(keyMapper?: (v: T) => (number | string)): Array<T>;

        groupBy(grouper: (v: T) => any): (T[] & { key: any })[];
    }
}

// @ts-ignore
!Array.prototype.__cc_extended && Object.defineProperties(Array.prototype, {
    remove: {
        value: function (filter) {
            if (typeof (filter) == 'function') {
                for (var i = this.length - 1; i > -1; --i) {
                    filter(this[i], i, this) && this.splice(i, 1);
                }
            }
            else {
                for (var i = this.length - 1; i > -1; --i) {
                    this[i] === filter && this.splice(i, 1);
                }
            }
            return this;
        }
    },
    removeOne: {
        value: function (filter) {
            if (typeof (filter) == 'function') {
                for (var i = 0; i < this.length; ++i) {
                    if (filter(this[i], i, this)) {
                        this.splice(i, 1);
                        return this;
                    }
                }
            }
            else {
                for (var i = 0; i < this.length; ++i) {
                    if (this[i] === filter) {
                        this.splice(i, 1);
                        return this;
                    }
                }
            }
            return this;
        }
    },
    random: {
        value: function () {
            let element = this[Math.floor(Math.random() * this.length)];
            return element;
        }
    },
    fastRemoveAt: {
        value: function (index) {
            const length = this.length;
            if (index < 0 || index >= length) {
                return null;
            }
            let res = this[index];
            this[index] = this[length - 1];
            this.length = length - 1;
            return res;
        }
    },
    fastRemove: {
        value: function (value) {
            const index = this.indexOf(value);
            if (index >= 0) {
                this[index] = this[this.length - 1];
                --this.length;
                return true;
            }
            return false;
        }
    },
    first: {
        value: function () {
            return this.length ? this[0] : null;
        }
    },
    last: {
        value: function () {
            return this.length ? this[this.length - 1] : null;
        }
    },
    max: {
        value: function (mapper) {
            if (!this.length) {
                return null;
            }
            function _max(a, b) {
                return a > b ? a : b;
            }
            if (typeof (mapper) == 'function') {
                var max = mapper(this[0], 0, this);
                for (var i = 1; i < this.length; ++i) {
                    var temp = mapper(this[i], i, this);
                    max = temp > max ? temp : max;
                }
                return max;
            }
            else {
                return this.reduce(function (prev, cur) { return _max(prev, cur); });
            }
        }
    },
    min: {
        value: function (mapper) {
            if (!this.length) {
                return null;
            }
            function _min(a, b) {
                return a < b ? a : b;
            }
            if (typeof (mapper) == 'function') {
                var min = mapper(this[0], 0, this);
                for (var i = 1; i < this.length; ++i) {
                    var temp = mapper(this[i], i, this);
                    min = temp < min ? temp : min;
                }
                return min;
            }
            else {
                return this.reduce(function (prev, cur) { return _min(prev, cur); });
            }
        }
    },
    distinct: {
        value: function () {
            return this.filter(function (v, i, arr) { return arr.indexOf(v) === i; });
        }
    },
    filterIndex: {
        value: function (filter) {
            var output = [];
            for (var i = 0; i < this.length; ++i) {
                if (filter(this[i], i, this)) {
                    output.push(i);
                }
            }
            return output;
        }
    },
    count: {
        value: function (filter) {
            var result = 0;
            for (var i = 0; i < this.length; ++i) {
                if (filter(this[i], i, this)) {
                    ++result;
                }
            }
            return result;
        }
    },
    sum: {
        value: function (mapper) {
            var result = 0;
            for (var i = 0; i < this.length; ++i) {
                result += mapper ? mapper(this[i], i, this) : this[i];
            }
            return result;
        }
    },
    average: {
        value: function (mapper) {
            return this.sum(mapper) / this.length;
        }
    },
    orderBy: {
        value: function () {
            var mappers = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                mappers[_i] = arguments[_i];
            }
            return this.slice().sort(function (a, b) {
                for (var i = 0; i < mappers.length; ++i) {
                    var va = mappers[i](a);
                    var vb = mappers[i](b);
                    if (va > vb) {
                        return 1;
                    }
                    else if (va < vb) {
                        return -1;
                    }
                }
                return 0;
            });
        }
    },
    orderByDesc: {
        value: function () {
            var mappers = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                mappers[_i] = arguments[_i];
            }
            return this.slice().sort(function (a, b) {
                for (var i = 0; i < mappers.length; ++i) {
                    var va = mappers[i](a);
                    var vb = mappers[i](b);
                    if (va > vb) {
                        return -1;
                    }
                    else if (va < vb) {
                        return 1;
                    }
                }
                return 0;
            });
        }
    },
    binarySearch: {
        value: function (value, keyMapper) {
            var low = 0, high = this.length - 1;
            while (low <= high) {
                var mid = ((high + low) / 2) | 0;
                var midValue = keyMapper ? keyMapper(this[mid]) : this[mid];
                if (value === midValue) {
                    return mid;
                }
                else if (value > midValue) {
                    low = mid + 1;
                }
                else if (value < midValue) {
                    high = mid - 1;
                }
            }
            return -1;
        }
    },
    binaryInsert: {
        value: function (item, keyMapper, unique) {
            if (typeof (keyMapper) == 'boolean') {
                unique = keyMapper;
                keyMapper = undefined;
            }
            var low = 0, high = this.length - 1;
            var mid = NaN;
            var itemValue = keyMapper ? keyMapper(item) : item;
            while (low <= high) {
                mid = ((high + low) / 2) | 0;
                var midValue = keyMapper ? keyMapper(this[mid]) : this[mid];
                if (itemValue === midValue) {
                    if (unique) {
                        return mid;
                    }
                    else {
                        break;
                    }
                }
                else if (itemValue > midValue) {
                    low = mid + 1;
                }
                else if (itemValue < midValue) {
                    high = mid - 1;
                }
            }
            var index = low > mid ? mid + 1 : mid;
            this.splice(index, 0, item);
            return index;
        }
    },
    binaryDistinct: {
        value: function (keyMapper) {
            return this.filter(function (v, i, arr) { return arr.binarySearch(v, keyMapper) === i; });
        }
    },
    findLast: {
        value: function (predicate) {
            for (var i = this.length - 1; i > -1; --i) {
                if (predicate(this[i], i, this)) {
                    return this[i];
                }
            }
            return undefined;
        }
    },
    findLastIndex: {
        value: function (predicate) {
            for (var i = this.length - 1; i > -1; --i) {
                if (predicate(this[i], i, this)) {
                    return i;
                }
            }
            return -1;
        }
    },
    groupBy: {
        value: function (grouper) {
            var group = this.reduce(function (prev, next) {
                var groupKey = grouper(next);
                if (!prev[groupKey]) {
                    prev[groupKey] = [];
                }
                prev[groupKey].push(next);
                return prev;
            }, {});
            return Object.keys(group).map(function (key) {
                var arr = group[key];
                arr.key = key;
                return arr;
            });
        }
    },
    __cc_extended: {
        value: true
    }
});

export { };