type IKeyPath = string | (string|symbol|number)[]

export declare function createArray<T>(value: T, count?: number): T[];

export declare function unionArray(a: any[], b: any[]): any[];

export declare function interArray(a: any[], b: any[]): any[];

export declare function diffArray(a: any[], b: any[]): any[];

export declare function compArray(a: any[], b: any[]): any[];

/**
 * @param [prop] - unique by which property
 */
export declare function uniqueArray(arr: any[], prop?: string): any[];

/**
 * @param [by] - which property sort by
 */
export declare function sortArray(items: any[], by?: string, decs?: boolean): any[];

export declare function toArray(arr: any): any[];

export declare function flatArray(arr: any[][]): any[];

/**
 * slice an array into [count] sub-array
 */
export declare function groupArray(arr: any[], count: number): any[][];

/**
 * split an array to sevral
 */
export declare function splitArray(arr: any[], split: any | ((...params: any[]) => any)): any[][];

export declare function joinArray(arr: any[][], join: any): any[];

export declare function getConstructorOf(ins: any): any;

/**
 * Create a new Child any which is inherited from Parent any
 */
export declare function inherit(Parent: any, proptotypes?: any, statics?: any): any;

/**
 * mix Extend into Source, (notice: will override Source)
 */
export declare function mixin(Source: any, Extend: any): void;

export declare function createDate(datetime: Date | string | number, givenFormatter?: string): Date;

export declare function formatDate(datetime: Date | string | number, formatter: string, givenFormatter?: string): string;

/**
 * Create a function which cache result by parameters.
 * @example
 * const compute = compute_((x, y) => {
 *   return x + y
 * })
 *
 * // the following two computing will call original fn only once
 * const a = compute(1, 3)
 * const b = compute(1, 3)
 *
 * compute.clear() // clear all cache
 * @param fn - the original function to calculate result
 * @param [expire] - the time to expire cache, if set 0 (or not set), the cache will never be expired, default 0.
 * @returns you can call a .clear() method on this function to clear the cache
 */
export declare function compute_(fn: (...params: any[]) => any, expire?: number): (...params: any[]) => any;

/**
 * create a getter function which will cache the result, cache will be released automaticly
 * @example
 * const get = get_(() => {
 *   return Math.random()
 * })
 *
 * // the following two getting will call original fn only once
 * const a = get()
 * const b = get()
 * a === b
 *
 * // type: 1
 * const getter = get_(() => Date.now(), 1)
 * const e = getter()
 * Promise.then(() => {
 *   const h = getter()
 *   e !== h // cache is released in a previous Promise microtask
 * })
 * setTimeout(() => {
 *   const f = getter()
 *   e !== f // when type is 1, the cache will be release in a Promise microtask, so when we call setTimeout, cache is gone
 * })
 *
 * // type: 2
 * const use = get_(() => Date.now(), 2)
 * const m = use()
 * Promise.then(() => {
 *   const n = use()
 *   m === n // when type is 2, the cache will be release in a setTimeout task, so when we call in a Promise.then, cache is existing
 * })
 * setTimeout(() => {
 *   const l = use()
 *   m !== l // cache was released in a previous setTimeout task
 * })
 * @param fn - the getter function, notice, without parameters
 * @param [type] - the type of automatic releasing, default 1.
 *  - 0: never released
 *  - 1: in Promise microtask
 *  - 2: in timeout task
 *  - 3: in requestAnimationFrame
 *  - 4: in requestIdleCallback
 * @returns you can call .clear() to clear cache immediately
 */
export declare function get_(fn: (...params: any[]) => any, type?: number): (...params: any[]) => any;

/**
 * Create a function which return a Promise and cached by parameters.
 * @example
 * const fn = async_(async () => {})
 *
 * const a = fn()
 * const b = fn()
 *
 * a === b // the same Promise
 * @param fn - a function, can be async function or normal function
 * @param [expire] - the expire time for releasing cache
 * @returns .clear() is available
 */
export declare function async_(fn: (...params: any[]) => any, expire?: number): (...params: any[]) => any;

/**
 * create a function whose result will be cached, and the cache will be released by invoke count
 * @example
 * const invoke = invoke_(() => {
 *   return Math.random()
 * }, 2)
 *
 * const a = invoke()
 * const b = invoke()
 * const c = invoke()
 *
 * a === b
 * a !== c
 * @param [expire] - the expire time after latest invoke
 * @returns .clear() is avaliable
 */
export declare function invoke_(fn: (...params: any[]) => any, count?: number, expire?: number): (...params: any[]) => any;

/**
 * @example
 * const pipe = pipe_(
 *   x => x + 1,
 *   x => x - 1,
 *   x => x * x,
 *   x => x / x,
 * )
 *
 * const y = pipe(10) // 10
 */
export declare function pipe_(...fns: ((...params: any[]) => any)[]): (...params: any[]) => any;

export declare function isUndefined(value: any): boolean;

export declare function isNull(value: any): boolean;

export declare function isNone(value: any): boolean;

export declare function isArray(value: any): boolean;

export declare function isObject(value: any): boolean;

export declare function isDate(value: any): boolean;

export declare function isString(value: any): boolean;

export declare function isNumber(value: any): boolean;

export declare function isNaN(value: any): boolean;

export declare function isSymbol(value: any): boolean;

export declare function isFinite(value: any): boolean;

export declare function isInfinite(value: any): boolean;

export declare function isBoolean(value: any): boolean;

export declare function isNumeric(value: any): boolean;

export declare function isBlob(value: any): boolean;

export declare function isFile(value: any): boolean;

export declare function isFormData(value: any): boolean;

export declare function isEmpty(value: any): boolean;

/**
 * @param [isStrict] - where Constructor is to return false
 */
export declare function isFunction(value: any, isStrict?: boolean): boolean;

/**
 * judge whether a value is a Constructor
 * @param {number} [strict] - strict level
 * - 4: should must be one of native code, native class
 * - 3: can be babel transformed class
 * - 2: can be some function whose prototype has more than one properties
 * - 1: can be some function which has this inside
 * - 0: can be some function which has prototype
 */
export declare function isConstructor(f: any, strict?: number): boolean;

export declare function isTruthy(value: any): boolean;

export declare function isFalsy(value: any): boolean;

export declare function isEqual(value: any, target: any): boolean;

export declare function isLt(a: any, b: any): boolean;

export declare function isLte(a: any, b: any): boolean;

export declare function isGt(a: any, b: any): boolean;

export declare function isGte(a: any, b: any): boolean;

export declare function isPromise(value: any): boolean;

export declare function isInstanceOf(value: any, Constructor: any, isStrict?: boolean): boolean;

export declare function isInheritedOf(SubConstructor: any, Constructor: any, isStrict?: boolean): boolean;

/**
 * check wether a property is the given object's own property,
 * it will check:
 * - only string properties (except symbol properties, different from hasOwnKey),
 * - only enumerable properties;
 * @param {boolean} [own] - use hasOwnKey to check
 */
export declare function inObject(key: string, obj: any, own?: boolean): boolean;

/**
 * check wether a property is the given object's own property,
 * as default, it will check:
 * - both string and symbol properties (different from inObject),
 * - both enumerable and non-enumerable properties;
 */
export declare function hasOwnKey(obj: any | any[], key: string, enumerable?: boolean): boolean;

export declare function inArray(item: any, arr: any[]): boolean;

export declare function isArrayInArray(shortArr: any[], longArr: any[]): boolean;

/**
 * compare two value whether they are shallow equal
 * @param objA
 * @param objB
 * @param deepth how deep to compare, default 0
 */
export declare function isShallowEqual(objA: any, objB: any, deepth?: number): boolean;

/**
 * convert a keyPath string to be an array
 * @param [isStrict] - whether to keep square bracket keys
 */
export declare function makeKeyChain(path: string, isStrict?: boolean): string[];

/**
 * convert an array to be a keyPath string
 * @param chain - the array for path, without any symbol in it
 * @param [isStrict] - wether to use [] to wrap number key
 */
export declare function makeKeyPath(chain: (string|symbol)[], isStrict?: boolean): string;

/**
 * convert a keyPath array or string to be a keyPath string
 */
export declare function makeKey(keyPath: IKeyPath): string;

/**
 * parse a property's value by its keyPath
 */
export declare function parse(obj: object | any[], keyPath: IKeyPath): any;

/**
 * parse a deep property into a thin object
 */
export declare function parseAs(obj: object | any[], keyPath: IKeyPath): any;

/**
 * assign a property's value by its keyPath
 */
export declare function assign<T>(obj: T, keyPath: IKeyPath, value: any): T;

/**
 * remove a property by its keyPath
 */
export declare function remove<T>(obj: T, keyPath: IKeyPath): T;

/**
 * check whether a keyPath is in the given object,
 * both string and symbol properties will be checked,
 * as default, it will check:
 *  - both enumerable and non-enumerable properties;
 *  - both own and prototype-chain properties;
 * if enumerable=true, it will check:
 *  - only enumerable properties;
 *  - only own properties;
 */
export declare function keyin(keyPath: IKeyPath, obj: object, enumerable?: any): boolean;

export declare function numerify(num: number | string): string;

export declare function enumerify(input: number | string): string;

export declare function clearNum00(input: number | string): string;

export declare function plusby(a: number | string, b: number | string): string;

export declare function minusby(a: number | string, b: number | string): string;

export declare function multiplyby(a: number | string, b: number | string): string;

/**
 * @param [decimal] - decimal length
 */
export declare function divideby(a: number | string, b: number | string, decimal?: number): string;

export declare function compareby(a: number | string, b: number | string): number;

export declare function calculate(exp: string, decimal?: number): string;

export declare function fixNum(input: number | string, decimal?: number, pad?: boolean, floor?: boolean): string;

export declare function formatNum(input: number | string, separator: string, count: number, formatdecimal?: boolean): string;

export declare function formatNum1000(input: number | string, formatdecimal?: boolean): string;

export declare function num10to62(num: number | string): string;

export declare function num62to10(code: string): number;

export declare function clone<T extends any>(obj: T): T;

/**
 * Deep extend an object
 * @param [mixArr] - 0: extend array as object, 1: push into array, 2: replace all items
 */
export declare function extend(obj1: any, obj2: any, mixArr?: 0 | 1 | 2): any;

export declare function merge(obj1: any, obj2: any, concatArray?: boolean): any;

export declare function stringify(obj: any): string;

export declare function getObjectHash(obj: any): string;

export declare function define(obj: any, key: string, descriptor: any | ((...params: any[]) => any)): any;

export declare function flat(obj: any | any[], determine?: (...params: any[]) => any): any;

export declare function each(obj: any | any[], fn: (...params: any[]) => any, descriptor?: boolean): any | any[];

export declare function map(obj: any | any[], fn: (...params: any[]) => any): any;

export declare function filter(obj: any | any[], fn: (...params: any[]) => any): any;

/**
 * 对对象进行迭代，支持异步
 */
export declare function iterate(obj: any | any[], fn: (value: any, key: string, next: () => void) => boolean): void;

/**
 * 在对象中查找，fn返回true表示找到，返回false表示没有找到继续找，找到后返回该属性的key，通过key就可以方便的获取value
 */
export declare function find(obj: any | any[], fn: (value: any, key: string) => boolean): string;

/**
 * 在对象中搜索，当fn返回结果为undefined时，表示未搜索到结果，继续搜索，当返回其他内容时，表示已经找到内容，并将该内容作为结果返回
 */
export declare function search<T>(obj: any | any[], fn: (value: any, key: string) => T): T;

export declare function extract(obj: any, keys: any[]): any;

/**
 * @alias extract
 */
export declare function pick(obj: any, keys: any[]): any;

/**
 * deep freeze
 */
export declare function freeze(o: any): any;

type ProxyArrayMethods = 'push' | 'unshift' | 'splice' | 'shift' | 'pop' | 'sort' | 'reverse' | 'fill' | 'insert' | 'remove'
type ProxyArrayFn = (keyPath?: (string | number | symbol)[], args?: any[]) => any[] | false | {
    to: ProxyArrayMethods;
    args: any[];
}
type ProxyHandler = {
    get?: (keyPath?: (string | number | symbol)[], active?: any) => any;
    set?: (keyPath?: (string | number | symbol)[], active?: any) => any;
    del?: (keyPath?: (string | number | symbol)[]) => void;

    dispatch?: (info?: {
        keyPath: (string | number | symbol)[];
        value: any;
        prev: any;
        next: any;
        invalid: any;
        active: any;

        /**
         * only for array
         */
        fn?: ProxyArrayMethods;
        reuslt?: any;
    }, isSameWithPrev?: boolean) => void;
    writable?: (keyPath?: (string | number | symbol)[], value?: any) => boolean;
    disable?: (keyPath?: (string | number | symbol)[], value?: any) => boolean;
    receive?: (keyPath?: (string | number | symbol)[], value?: any, fn?: ProxyArrayMethods, args?: any[]) => void;

    push?: ProxyArrayFn;
    unshift?: ProxyArrayFn;
    splice?: ProxyArrayFn;
    shift?: ProxyArrayFn;
    pop?: ProxyArrayFn;
    sort?: ProxyArrayFn;
    reverse?: ProxyArrayFn;
    fill?: ProxyArrayFn;

    insert?: ProxyArrayFn;
    remove?: ProxyArrayFn;
}

/**
 * create a reactive object.
 * it will change your original data
 * @example
 * const some = {
 *   body: {
 *     hand: true,
 *     foot: true,
 *   },
 * }
 * const a = createReactive(some, {
 *   get(keyPath, value) {
 *     if (keyPath.join('.') === 'body.hand') {
 *       return value.toString()
 *     }
 *     else {
 *       return value
 *     }
 *   },
 *   set(keyPath, value) {},
 *   dispatch({
 *     keyPath,
 *     value, // receive value
 *     input, // getter output
 *     next, // created reactive
 *     prev, // current reactive
 *   }, force) {},
 * })
 *
 * a !== some // reactive object !== object
 * a.body !== some.body // reactive object !== object
 * a.body.hand !== some.body.hand // true !== 'true'
 * a.body.foot == some.body.foot // true == true
 *
 * a.body.hand = false // now a.body.hand is 'false', a string
 * some.body.hand === false // original data changed
 * @param options.get - to modify output value of each node, receive (keyPath, reactiveValue), reactiveValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param options.set - to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param options.dispatch - to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param options.writable - whether be able to change value, return false to disable writable, default is true
 * @param options.disable - return true to disable create nest reactive on this node
 */
export declare function createReactive(origin: any | any[], options: ProxyHandler): any | any[];

/**
 * create a proxy object.
 * it will change your original data
 * @example
 * const some = {
 *   body: {
 *     hand: true,
 *     foot: true,
 *   },
 * }
 * const a = createProxy(some, {
 *   get(keyPath, value) {
 *     if (keyPath.join('.') === 'body.hand') {
 *       return value.toString()
 *     }
 *     else {
 *       return value
 *     }
 *   },
 *   set(keyPath, value) {},
 *   dispatch(keyPath, next, current) {},
 * })
 *
 * a !== some // proxy object !== object
 * a.body !== some.body // proxy object !== object
 * a.body.hand !== some.body.hand // true !== 'true'
 * a.body.foot == some.body.foot // true == true
 *
 * a.body.hand = false // now a.body.hand is 'false', a string
 * some.body.hand === false // some.body.hand changes to false
 * @param options.get - to modify output value of each node, receive (keyPath, proxiedValue), proxiedValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param options.set - to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param options.dispatch - to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param options.writable - whether be able to change value, return false to disable writable, default is true
 */
export declare function createProxy(origin: any | any[], options: ProxyHandler): any;

/**
 * detect whether an object is a Proxy which created by createProxy
 * @param value
 */
export declare function isProxy(value: any): boolean;

/**
 * get the original object from a Proxy which created by createProxy
 * @param proxy
 */
export declare function refineProxy(proxy: any): any | undefined;

/**
 * convert a string to safe expression which can be passed into new RegExp
 * @param exp
 */
export declare function createSafeExp(exp: string): string;

export declare function matchAll(regexp: RegExp, str: string): any[];

/**
 *
 * @param input input string
 * @param separator separator between two sliced string words
 * @param segments slice input at these points
 * @param alignright slice from right to left
 */
export declare function formatString(input: string, separator: string, segments: number | number[], alignright?: boolean): string;

export declare function padLeft(str: string, len: number, pad: boolean): string;

export declare function padRight(str: string, len: number, pad: boolean): string;

export declare function getStringHash(str: string): string;

export declare function createRandomString(len: number): string;

export declare function interpolate(template: string, data: any, opts?: any): string;

/**
 * get value by using a function
 */
export declare function decideby(decide: (...params: any[]) => any, ...args: any[]): any;

/**
 * get value by different conditions
 * @param entries - [[condition, getter]]
 */
export declare function caseby(entries: ((...params: any[]) => void)[]): any;

/**
 * @param [immediate]
 */
export declare function debounce(fn: (...params: any[]) => any, wait: number, immediate?: boolean): (...params: any[]) => any;

/**
 * @param [immediate]
 */
export declare function throttle(fn: (...params: any[]) => any, wait: number, immediate?: boolean): (...params: any[]) => any;
