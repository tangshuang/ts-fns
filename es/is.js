/**
 * @module is
 */

import { unionArray } from './array.js'

/** */
export function isUndefined(value) {
  return typeof value === 'undefined'
}

/** */
export function isNull(value) {
  return value === null
}

/** */
export function isNone(value) {
  return isUndefined(value) || isNull(value)
}

/** */
export function isArray(value) {
  return Array.isArray(value)
}

/** */
export function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object
}

/** */
export function isDate(value) {
  return isInstanceOf(value, Date)
}

/** */
export function isString(value) {
  return typeof value === 'string'
}

/** */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

/** */
export function isNaN(value) {
  return typeof value === 'number' && Number.isNaN(value)
}

/** */
export function isSymbol(value) {
  return typeof value === 'symbol'
}

/** */
export function isFinite(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

/** */
export function isInfinite(value) {
  return !isNaN(value) && !Number.isFinite(value)
}

/** */
export function isBoolean(value) {
  return value === true || value === false
}

/** */
export function isNumeric(value) {
  return isString(value) && /^\-{0,1}[0-9]+\.{0,1}([0-9]+){0,1}$/.test(value)
}

/** */
export function isBlob(value) {
  return isInstanceOf(value, Blob)
    || (
      value
      && typeof value.size === 'number'
      && typeof value.type === 'string'
    )
}

/** */
export function isFile(value) {
  return isInstanceOf(value, File)
    || (
      isBlob(value)
      && (typeof value.lastModifiedDate === 'object' || typeof value.lastModified === 'number')
      && typeof value.name === 'string'
    )
}

/** */
export function isFormData(value) {
  return isInstanceOf(value, FormData)
}

/** */
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

/** */
export function isFunction(value) {
  return typeof value === 'function' && !isConstructor(value, 2)
}

/**
 * judge whether a value is a Constructor
 * @param {*} f
 * @param {int} [strict] strict level
 * - 3: should must be one of native code, native class definition or babel transformed class
 * - 2: can be some function whose prototype has more than one properties
 * - 1: can be some function which has this inside
 * - 0: can be some function which has prototype
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

  // std lib: String, Number...
  const isNativeSTD = entire === `function ${f.name}() { [native code] }`

  // native class definition
  const isNativeClass = entire.indexOf('class ') === 0

  // babel transformed class, begin with '_classCallCheck(this,', may by minified by compile tool
  const isBabelTransformedClass = /^[_a-zA-Z0-9]+\(this,/.test(fnBody)
  // @babel/plugin-transform-runtime '(0, _classCallCheck2["default"])(this,'
  const isBabelRuntimeTransformedClass = /^\(.*?\)\(this,/.test(fnBody)

  const isMostStrict = isNativeSTD || isNativeClass || isBabelTransformedClass || isBabelRuntimeTransformedClass
  if (strict == 3) {
    return isMostStrict
  }

  // there are some properties on f.prototype
  const protos = Object.getOwnPropertyDescriptors(f.prototype)
  const keys = Object.keys(protos).filter(item => item !== 'constructor')
  const hasProtos = !!keys.length

  if (strict == 2) {
    return isMostStrict || hasProtos
  }

  // function() { this.name = 'xx' }
  const topctx = fnBody.replace(/function.*?\{.*?\}/g, '')
    .replace(/\n+/g, ';')
    .replace(/\s+/g, '')
    .replace(/;;/g, ';')
  const hasThisInside = topctx.indexOf('this.') === 0 || topctx.indexOf(';this.') > -1 || topctx.indexOf('=this;') > -1

  if (strict == 1) {
    return isMostStrict || hasProtos || hasThisInside
  }

  return true
}

/** */
export function isTruthy(value) {
  return !!value
}

/** */
export function isFalsy(value) {
  return !value
}

/** */
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

/** */
export function isLt(a, b) {
  return a < b
}

/** */
export function isLte(a, b) {
  return a <= b
}

/** */
export function isGt(a, b) {
  return a > b
}

/** */
export function isGte(a, b) {
  return a >= b
}

/** */
export function isPromise(value) {
  return isInstanceOf(value, Promise)
    || (
      value
      && (typeof value === 'object' || typeof value === 'function')
      && typeof value.then === 'function'
    )
}

/** */
export function isInstanceOf(value, Constructor, real = false) {
  if (!value || typeof value !== 'object') {
    return false
  }
  if (real) {
    return value.constructor === Constructor
  }
  else {
    return value instanceof Constructor
  }
}

/** */
export function isInheritedOf(SubConstructor, Constructor, strict) {
  const ins = SubConstructor.prototype
  return isInstanceOf(ins, Constructor, strict)
}

/** */
export function inObject(key, obj, own) {
  if (typeof obj !== 'object') {
    return false
  }
  if (own) {
    const keys = Object.getOwnPropertyNames(obj)
    return inArray(key, keys)
  }
  else {
    const keys = Object.keys(obj)
    return inArray(key, keys)
  }
}

/** */
export function inArray(item, arr) {
  return isArray(arr) && arr.includes(item)
}
