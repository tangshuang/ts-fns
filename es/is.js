import { unionArray } from './array.js'

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isUndefined(value) {
  return typeof value === 'undefined'
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNull(value) {
  return value === null
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNone(value) {
  return isUndefined(value) || isNull(value) || isNaN(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isArray(value) {
  return Array.isArray(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isDate(value) {
  return isInstanceOf(value, Date)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isString(value) {
  return typeof value === 'string'
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNaN(value) {
  return typeof value === 'number' && Number.isNaN(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isSymbol(value) {
  return typeof value === 'symbol'
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isFinite(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isInfinite(value) {
  return typeof value === 'number' && !Number.isNaN(value) && !Number.isFinite(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isBoolean(value) {
  return value === true || value === false
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNumeric(value) {
  return isString(value) && /^\-{0,1}[0-9]+\.{0,1}([0-9]+){0,1}$/.test(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isBlob(value) {
  return isInstanceOf(value, Blob)
    || (
      value
      && typeof value.size === 'number'
      && typeof value.type === 'string'
    )
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isFile(value) {
  return isInstanceOf(value, File)
    || (
      isBlob(value)
      && (typeof value.lastModifiedDate === 'object' || typeof value.lastModified === 'number')
      && typeof value.name === 'string'
    )
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isFormData(value) {
  return isInstanceOf(value, FormData)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (isNone(value) || value === '' || isNaN(value)) {
    return true
  }
  else if (isArray(value)) {
    return value.length === 0
  }
  else if (isObject(value)) {
    return Object.getOwnPropertyNames(value).length === 0
  }
  else {
    return false
  }
}

/**
 * @param {*} value
 * @param {boolean} [isStrict] where Constructor is to return false
 * @returns {boolean}
 */
export function isFunction(value, isStrict) {
  if (typeof value !== 'function') {
    return false
  }
  return isStrict ? !isConstructor(value, 2) : true
}

/**
 * judge whether a value is a Constructor
 * @param {*} f
 * @param {number} [strict] strict level
 * - 4: should must be one of native code, native class
 * - 3: can be babel transformed class
 * - 2: can be some function whose prototype has more than one properties
 * - 1: can be some function which has this inside
 * - 0: can be some function which has prototype
 * @returns {boolean}
 */
export function isConstructor(f, strict) {
  if (typeof f !== 'function') {
    return false
  }

  if (f === Symbol) {
    return false
  }

  // bond function && arrow function
  if (!f.prototype) {
    return false
  }

  const entire = f + ''
  const fnBody = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}")).trim()

  // native class definition
  const isNativeClass = entire.indexOf('class ') === 0
  // std lib: String, Number...
  const isNativeSTD = fnBody === `[native code]`

  const level4 = isNativeClass || isNativeSTD
  if (strict >= 4) {
    return level4
  }

  const topCtx = fnBody.replace(/function.*?\{.*?\}/gm, '')
    .replace(/return/gm, '')
    .replace(/\n+/gm, ';')
    .replace(/\s+/gm, '')
    .replace(/;;/gm, ';')
  // babel transformed class, begin with '_classCallCheck(this,', may by minified by compile tool
  const isBabelTransformedClass = /^_classCallCheck\(this,/.test(topCtx)
  // @babel/plugin-transform-runtime '(0, _classCallCheck2["default"])(this,'
  const isBabelRuntimeTransformedClass = /^\(.*?_classCallCheck.*?\)\(this,/.test(topCtx)
  // webpack minified
  const isBabelTransformedMinifiedClass = /^[0-9a-zA-Z_;!?:]*?\(this,/.test(topCtx)

  const level3 = level4 || isBabelTransformedClass || isBabelRuntimeTransformedClass || isBabelTransformedMinifiedClass
  if (strict == 3) {
    return level3
  }

  // there are some properties on f.prototype
  const protos = Object.getOwnPropertyDescriptors(f.prototype)
  const keys = Object.keys(protos).filter(item => item !== 'constructor')
  const hasProtos = !!keys.length

  const level2 = level3 || hasProtos
  if (strict == 2) {
    return level2
  }

  // function() { this.name = 'xx' }
  const hasThisInside = topCtx.indexOf('this.') === 0 || topCtx.indexOf(';this.') > -1 || topCtx.indexOf('=this;') > -1

  const level1 = level2 || hasThisInside
  if (strict == 1) {
    return level1
  }

  return true
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isTruthy(value) {
  return !!value
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isFalsy(value) {
  return !value
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isEqual(val1, val2) {
  const equal = (obj1, obj2) => {
    const keys1 = Object.getOwnPropertyNames(obj1)
    const keys2 = Object.getOwnPropertyNames(obj2)
    const keys = unionArray(keys1, keys2)

    for (let i = 0, len = keys.length; i < len; i ++) {
      const key = keys[i]

      if (!inArray(key, keys1)) {
        return false
      }
      if (!inArray(key, keys2)) {
        return false
      }

      const value1 = obj1[key]
      const value2 = obj2[key]
      if (!isEqual(value1, value2)) {
        return false
      }
    }

    return true
  }

  if (isObject(val1) && isObject(val2)) {
    return equal(val1, val2)
  }
  else if (isArray(val1) && isArray(val2)) {
    return equal(val1, val2)
  }
  else {
    return val1 === val2
  }
}

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function isLt(a, b) {
  return a < b
}

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function isLte(a, b) {
  return a <= b
}

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function isGt(a, b) {
  return a > b
}

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function isGte(a, b) {
  return a >= b
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isPromise(value) {
  return isInstanceOf(value, Promise)
    || (
      value
      && (typeof value === 'object' || typeof value === 'function')
      && typeof value.then === 'function'
    )
}

/**
 * @param {*} value
 * @param {Class} Constructor
 * @param {boolean} [isStrict]
 * @returns {boolean}
 */
export function isInstanceOf(value, Constructor, isStrict) {
  if (!value || typeof value !== 'object') {
    return false
  }
  if (isStrict) {
    return value.constructor === Constructor
  }
  else {
    return value instanceof Constructor
  }
}

/**
 * @param {Class} SubConstructor
 * @param {Class} Constructor
 * @param {boolean} [isStrict]
 * @returns {boolean}
 */
export function isInheritedOf(SubConstructor, Constructor, isStrict) {
  if (typeof SubConstructor !== 'function') {
    return false
  }

  const ins = SubConstructor.prototype
  if (!ins) {
    return false
  }

  return isInstanceOf(ins, Constructor, isStrict)
}

/**
 * @param {string} key
 * @param {object} obj
 * @param {boolean} [own] whether use getOwnPropertyNames to determine
 * @returns {boolean}
 */
export function inObject(key, obj, own) {
  if (typeof obj !== 'object') {
    return false
  }
  if (own) {
    const keys = Object.getOwnPropertyNames(obj)
    return inArray(key, keys)
  }
  // array keys will be ['0', '1', '2']
  else if (isArray(obj)) {
    const keys = Object.keys(obj)
    return inArray('' + key, keys)
  }
  else {
    const keys = Object.keys(obj)
    return inArray(key, keys)
  }
}

/**
 * @param {*} item
 * @param {array} arr
 * @returns {boolean}
 */
export function inArray(item, arr) {
  return isArray(arr) && arr.includes(item)
}

/**
 * @param {object} objA
 * @param {object} objB
 */
export function isShallowEqual(objA,objB){
  if(objA === objB) {
    return true
  }

  if(!(typeof objA === 'object' && objA !== null) || !(typeof objB === 'object' && objB !== null)) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i ++) {
    const keyA = keysA[i]
    const keyB = keysB[i]

    if (!Object.prototype.hasOwnProperty.call(objB, keyA)) {
      return false
    }

    if (!Object.prototype.hasOwnProperty.call(objA, keyB)) {
      return false
    }

    if (objA[keyA] !== objB[keyA]) {
      return false
    }

    if (objA[keyB] !== objB[keyB]) {
      return false
    }
  }

  return true
}

export function isOneInArray(items, arr) {
  return arr.some(one => items.includes(one))
}

export function isAllInArray(items, arr) {
  return !arr.some(one => !items.includes(one))
}
