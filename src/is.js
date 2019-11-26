/**
 * @module is
 */

import { unionArray } from './array.js'

export function isUndefined(value) {
  return value === undefined
}

export function isNull(value) {
  return value === null
}

export function isNil (value) {
  return isUndefined(value) || isNull(value)
}

export function isArray(value) {
  return Array.isArray(value)
}

export function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object
}

export function isDate(value) {
  return value instanceof Date
}

export function isString(value) {
  return typeof value === 'string'
}

export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value)
}

export function isNaN(value) {
  return typeof value === 'number' && Number.isNaN(value)
}

export function isFinite(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isInfinite(value) {
  return typeof value === 'number' && !Number.isNaN(value) && !Number.isFinite(value)
}

export function isBoolean(value) {
  return value === true || value === false
}

export function isNumeric(value) {
  return isString(value) && /^\-{0,1}[0-9]+(\.{0,1}[0-9]+){0,1}$/.test(value)
}

export function isBlob(value) {
  return value && typeof value.size === 'number' && typeof value.type === 'string'
}

export function isFile(value) {
  return isBlob(value)
    && (typeof value.lastModifiedDate === 'object' || typeof value.lastModified === 'number')
    && typeof value.name === 'string'
}

export function isFormData(value) {
  return value instanceof FormData
}

export function isEmpty(value) {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
    return true
  }
  else if (isArray(value)) {
    return value.length === 0
  }
  else if (isObject(value)) {
    return Object.keys(value).length === 0
  }
  return false
}

export function isFunction(value) {
  return typeof value === 'function'
		&& (value + '') !== `function ${value.name}() { [native code] }` // String, Number
		&& (value + '').indexOf('class ') !== 0 // class
		&& (value + '').indexOf('_classCallCheck(this,') === -1 // babel transformed class
}

export function isTruthy(value) {
  return !!value
}

export function isFalsy(value) {
  return !value
}

export function isEqual(val1, val2) {
  const equal = (obj1, obj2) => {
    let keys1 = Object.keys(obj1)
    let keys2 = Object.keys(obj2)
    let keys = unionArray(keys1, keys2)

    for (let i = 0, len = keys.length; i < len; i ++) {
      let key = keys[i]

      if (!inArray(key, keys1)) {
        return false
      }
      if (!inArray(key, keys2)) {
        return false
      }

      let value1 = obj1[key]
      let value2 = obj2[key]
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

export function isLt(a, b) {
  return a < b
}

export function isLte(a, b) {
  return a <= b
}

export function isGt(a, b) {
  return a > b
}

export function isGte(a, b) {
  return a >= b
}

export function isPromise (value) {
  if (isInstanceOf(value, Promise)) {
    return true
  }
  return value
    && (typeof value === 'object' || typeof value === 'function')
    && typeof value.then === 'function'
}

export function isConstructor(f) {
  if (typeof f !== 'function') {
    return false
  }

  if (f === Symbol) {
    return false
  }

  // bond function && arrow function
  const prototype = f.prototype
  if (!prototype) {
    return false
  }

  return true
}

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

export function isInheritedOf(SubConstructor, Constructor, strict) {
  const ins = SubConstructor.prototype
  return isInstanceOf(ins, Constructor, strict)
}

export function inObject(key, obj) {
  if (typeof obj !== 'object') {
    return false
  }
  return key in obj
}

export function inArray(item, arr) {
  return isArray(arr) && arr.includes(item);
}
