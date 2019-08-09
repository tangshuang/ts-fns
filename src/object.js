/**
 * @module object
 */

import { getStringHash } from './string.js'
import { isArray, isObject, isFile, isDate, isFunction } from './is.js'

export function clone(obj) {
  const parents = []
  const clone = function(origin) {
    if (!isObject(origin) && !isArray(origin)) {
      return origin
    }

    const result = isArray(origin) ? [] : {}
    const keys = Object.keys(origin)

    parents.push({ origin, result })

    for (let i = 0, len = keys.length; i < len; i ++) {
      const key = keys[i]
      const value = origin[key]
      const referer = parents.find(item => item.origin === value)

      if (referer) {
        result[key] = referer.result
      }
      else {
        result[key] = clone(value)
      }
    }

    return result
  }

  const result = clone(obj)
  return result
}

export function merge(obj1, obj2, contactArray = true) {
  obj1 = clone(obj1)

  if (!isArray(obj2) && !isObject(obj2)) {
    return isArray(obj1) && isObject(obj1) ? obj1 : null
  }

  obj2 = clone(obj2)

  if (!isArray(obj1) && !isObject(obj1)) {
    return isArray(obj2) && isObject(obj2) ? obj2 : null
  }

  const exists = []
  const merge = (obj1, obj2) => {
    if (isArray(obj1)) {
      if (isArray(obj2) && contactArray) {
        return obj1.contact(obj2)
      }
    }

    const result = obj1
    const keys = Object.keys(obj2)
    keys.forEach((key) => {
      const oldValue = obj1[key]
      const newValue = obj2[key]

      if (isObject(newValue) || isArray(newValue)) {
        const index = exists.indexOf(newValue)
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
          const num = exists.length - 1
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
  const props = {}
  each(values, (value, key) => {
    props[key] = { ...options, value }
  })
  Object.defineProperties(obj, props)
}

export function defineGetter(obj, key, get, options = {}) {
  Object.defineProperty(obj, key, { ...options, get })
}

export function defineGetters(obj, getters, options = {}) {
  const props = {}
  each(getters, (get, key) => {
    props[key] = { ...options, get }
  })
  Object.defineProperties(obj, props)
}

export function flatObject(obj, determine) {
  const flat = (input, path = '', result = {}) => {
    if (isArray(input)) {
      input.forEach((item, i) => flat(item, `${path}[${i}]`, result))
      return result
    }
    else if (input && typeof input === 'object' && !isFile(input) && !isDate(input)) {
      if (isFunction(determine) && !determine(input)) {
        result[path] = input
        return result
      }

      each(input, (value, key) => {
        flat(value, !path ? key : `${path}[${key}]`, result)
      })
      return result
    }
    else {
      result[path] = input
      return result
    }
  }
  return flat(obj)
}

export function each(obj, fn) {
  if (isArray(obj)) {
    obj.forEach(fn)
  }
  else {
    const keys = Object.keys(obj)
    keys.forEach((key) => {
      const value = obj[key]
      fn(value, key, obj)
    })
  }
}

export function map(obj, fn) {
  if (isArray(obj)) {
    return obj.map(fn)
  }
  else {
    const result = {}
    each(obj, (value, key) => {
      result[key] = fn(value, key, obj)
    })
    return result
  }
}

export function filter(obj, fn) {
  if (isArray(obj)) {
    return obj.filter(fn)
  }
  else {
    const result = {}
    each(obj, (value, key) => {
      const bool = fn(value, key, obj)
      if (!bool) {
        return
      }
      result[key] = value
    })
    return result
  }
}

export function iterate(obj, fn) {
  if (isArray(obj)) {
    for (let i = 0, len = obj.length; i < len; i ++) {
      const item = obj[i]
      const res = fn(item, i, obj)
      if (res !== undefined) {
        return res
      }
    }
  }
  else {
    const keys = Object.keys(obj)
    for (let i = 0, len = keys.length; i < len; i ++) {
      const key = keys[i]
      const value = obj[key]
      const res = fn(value, key, obj)
      if (res !== undefined) {
        return res
      }
    }
  }
}

export function find(obj, fn) {
  return iterate(obj, (value, key) => {
    const res = fn(value, key, obj)
    if (res) {
      return value === undefined ? null : value
    }
  })
}
