/**
 * @module object
 */

import { getStringHash } from './string.js'
import { isArray, isObject, isFile, isDate, isFunction } from './is.js'
import { clone } from './clone.js'

export function mergeObjects(obj1, obj2, contactArray = true) {
  obj1 = clone(obj1)

  if (!isArray(obj2) || !isObject(obj2)) {
    return isArray(obj1) || isObject(obj1) ? obj1 : null
  }

  obj2 = clone(obj2)

  if (!isArray(obj1) || !isObject(obj1)) {
    return isArray(obj2) || isObject(obj2) ? obj2 : null
  }

  const exists = []
  const merge = (obj1, obj2) => {
    if (isArray(obj1)) {
      if (isArray(obj2) && contactArray) {
        return obj1.contact(obj2)
      }
    }

    let result = obj1
    let keys = Object.keys(obj2)
    keys.forEach((key) => {
      let oldValue = obj1[key]
      let newValue = obj2[key]

      if (isObject(newValue) || isArray(newValue)) {
        let index = exists.indexOf(newValue)
        if (index === -1) {
          exists.push(newValue)
        }
        else if (!isArray(oldValue) && !isObject(oldValue)) {
          result[key] = newValue
          return
        }
      }

      if (isObject(newValue) || isArray(newValue)) {
        if (isObject(oldValue) || isArray(oldValue)) {
          result[key] = merge(oldValue, newValue)
        }
        else {
          result[key] = newValue
        }
      }
      else {
        result[key] = newValue
      }
    })
    return result
  }

  return merge(obj1, obj2)
}

export function stringify(obj) {
  const exists = [obj]
  const used = []
  const stringifyObjectByKeys = (obj) => {
    if (isArray(obj)) {
      let items = obj.map((item) => {
        if (item && typeof item === 'object') {
          return stringifyObjectByKeys(item)
        }
        else {
          return JSON.stringify(item)
        }
      })
      let str = '[' + items.join(',') + ']'
      return str
    }

    let str = '{'
    let keys = Object.keys(obj)
    let total = keys.length
    keys.sort()
    keys.forEach((key, i) => {
      let value = obj[key]
      str += key + ':'

      if (value && typeof value === 'object') {
        let index = exists.indexOf(value)
        if (index > -1) {
          str += '#' + index
          used.push(index)
        }
        else {
          exists.push(value)
          let num = exists.length - 1
          str += '#' + num + stringifyObjectByKeys(value)
        }
      }
      else {
        str += JSON.stringify(value)
      }

      if (i < total - 1) {
        str += ','
      }
    })
    str += '}'
    return str
  }
  let str = stringifyObjectByKeys(obj)

  exists.forEach((item, i) => {
    if (!used.includes(i)) {
      str = str.replace(new RegExp(`:#${i}`, 'g'), ':')
    }
  })

  if (used.includes(0)) {
    str = '#0' + str
  }

  return str
}

export function getObjectHash(obj) {
  if (typeof obj !== 'object') {
    return
  }

  let str = stringify(obj)
  let hash = getStringHash(str)
  return hash
}

export function defineProperty(obj, key, value, options = {}) {
  Object.defineProperty(obj, key, { ...options, value })
}

export function defineProperties(obj, values, options = {}) {
  let keys = Object.keys(values)
  let props = {}
  keys.forEach((key) => {
    let value = values[key]
    props[key] = { ...options, value }
  })
  Object.defineProperties(obj, props)
}

export function defineGetter(obj, key, get, options = {}) {
  Object.defineProperty(obj, key, { ...options, get })
}

export function flatObject(obj, determine) {
  const flat = (input, path = '', result = {}) => {
    if (Array.isArray(input)) {
      input.forEach((item, i) => flat(item, `${path}[${i}]`, result));
      return result;
    }
    else if (input && typeof input === 'object' && !isFile(input) && !isDate(input)) {
      if (isFunction(determine) && !determine(input)) {
        result[path] = input;
        return result
      }

      let keys = Object.keys(input);
      keys.forEach((key) => {
        let value = input[key];
        flat(value, !path ? key : `${path}[${key}]`, result);
      });
      return result;
    }
    else {
      result[path] = input;
      return result;
    }
  }
  if (!obj || typeof obj !== 'object') {
    return {}
  }
  return flat(obj)
}

export function each(obj, fn) {
  const keys = Object.keys(obj)
  keys.forEach((key) => {
    const value = obj[key]
    fn(value, key, obj)
  })
}

export function map(obj, fn) {
  const result = isArray(obj) ? [] : {}
  each(obj, (value, key) => {
    result[key] = fn(value, key, obj)
  })
  return result
}

export function filter(obj, fn) {
  const isArr = isArray(obj)
  const result = isArr ? [] : {}
  each(obj, (value, key) => {
    const bool = fn(value, key, obj)
    if (!bool) {
      return
    }
    if (isArr) {
      result.push(value)
    }
    else {
      result[key] = value
    }
  })
  return result
}

export function iterate(obj, fn) {
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i ++) {
    const key = keys[i]
    const value = obj[key]
    const bool = fn(value, key, obj)
    if (!bool) {
      return
    }
  }
}
