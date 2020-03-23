/**
 * @module object
 */

import { getStringHash } from './string.js'
import { isArray, isObject, isFile, isDate, isFunction, inArray } from './is.js'

/** */
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

/** */
export function merge(obj1, obj2, concatArray = true) {
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
      if (isArray(obj2) && concatArray) {
        return [...obj1, ...obj2]
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

/** */
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

/** */
export function getObjectHash(obj) {
  if (typeof obj !== 'object') {
    return
  }

  let str = stringify(obj)
  let hash = getStringHash(str)
  return hash
}

/** */
export function defineProperty(obj, key, value, options = {}) {
  Object.defineProperty(obj, key, { ...options, value })
}

/** */
export function defineProperties(obj, values, options = {}) {
  const props = {}
  each(values, (value, key) => {
    props[key] = { ...options, value }
  })
  Object.defineProperties(obj, props)
}

/** */
export function defineGetter(obj, key, get, options = {}) {
  Object.defineProperty(obj, key, { ...options, get })
}

/** */
export function defineGetters(obj, getters, options = {}) {
  const props = {}
  each(getters, (get, key) => {
    props[key] = { ...options, get }
  })
  Object.defineProperties(obj, props)
}

/** */
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

/** */
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

/** */
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

/** */
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

/** */
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

/** */
export function find(obj, fn) {
  return iterate(obj, (value, key) => {
    const res = fn(value, key, obj)
    if (res) {
      return value === undefined ? null : value
    }
  })
}

/** */
export function extract(obj, keys) {
  const results = {}
  keys.forEach((key) => {
    if (inObject(key, obj)) {
      results[key] = obj[key]
    }
  })
  return results
}

/**
 * create a reactive object.
 * @notice it will change your original data
 * @param {*} input
 * @param {*} options
 * @param {function} options.get to modify output value of each node
 * @param {function} options.set to modify input value of each node
 * @param {function} options.dispatch to notify change with keyPath
 */
export function createReactive(input, options = {}) {
  const { get, set, dispatch } = options

  const create = (input, parents = []) => {
    if (!isObject(input) && !isArray(input)) {
      return input
    }

    let output = null
    if (isObject(input)) {
      output = createObject({ ...input }, parents)
    }
    else {
      output = createArray([...input], parents)
    }

    // Object.defineProperty(output, '__reactive__', { value: true })
    return output
  }

  const createObject = (obj, parents = []) => {
    const res = {}
    each(obj, (value, key) => {
      const keyPath = [...parents, key]
      const setValue = (v) => {
        const next = isFunction(set) ? set(v, keyPath) : v
        const coming = create(next, keyPath)
        obj[key] = coming
        return coming
      }
      // initialize the current value at the first time
      setValue(value)
      Object.defineProperty(res, key, {
        get: () => {
          const value = obj[key] // we should not use original value, because it may be changed at any time
          const node = isFunction(get) ? get(value, keyPath) : value
          return node
        },
        set: (v) => {
          const next = setValue(v)
          if (isFunction(dispatch)) {
            dispatch(keyPath, next)
          }
          return next
        },
        enumerable: true,
        configurable: true,
      })
    })
    return res
  }

  const createArray = (arr, parents) => {
    const res = []

    // fill items into output array
    const fill = (start, end, init = true) => {
      for (let i = start; i <= end; i ++) {
        const item = arr[i]
        const keyPath = [...parents, i]
        const setValue = (v) => {
          const next = isFunction(set) ? set(v, keyPath) : v
          const coming = create(next, keyPath)
          arr[i] = coming
          return coming
        }

        if (init) {
          // initialize items
          setValue(item)
        }

        Object.defineProperty(res, i, {
          get: () => {
            const item = arr[i]
            const node = isFunction(get) ? get(item, keyPath) : item
            return node
          },
          set: (v) => {
            const next = setValue(v)
            if (isFunction(dispatch)) {
              dispatch(keyPath, next)
            }
            return next
          },
          enumerable: true,
          configurable: true,
        })
      }
    }

    // change array prototype methods
    const modify = (fn) => ({
      value: function(...args) {
        // deal with original data
        const items = args.map(item => create(item, parents))
        const before = arr.length
        const o = Array.prototype[fn].call(arr, ...items)
        const after = arr.length

        // the methods will change the length of arr
        if (inArray(fn, ['push', 'unshift', 'splice'])) {
          // delete items
          if (before > after) {
            res.length = after
          }
          // insert items
          else if (after > before) {
            fill(before - 1, after - 1, false)
          }
        }

        if (isFunction(dispatch)) {
          dispatch(parents, res)
        }

        return o
      },
    })

    Object.defineProperties(res, {
      push: modify('push'),
      pop: modify('pop'),
      unshift: modify('unshift'),
      shift: modify('shift'),
      splice: modify('splice'),
      sort: modify('sort'),
      reverse: modify('reverse'),
      fill: modify('fill'),
      clear: function() {
        arr.length = 0
        res.length = 0

        if (isFunction(dispatch)) {
          dispatch(parents, res)
        }

        return this
      },
    })

    fill(0, arr.length - 1)

    return res
  }

  const output = create(input)
  return output
}
