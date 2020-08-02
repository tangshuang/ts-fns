/**
 * @module object
 */

import { getStringHash } from './string.js'
import { isArray, isObject, isFile, isDate, isFunction, inArray, isSymbol, inObject, isUndefined } from './is.js'

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

/**
 * Deep extend an object
 * @param {*} obj1
 * @param {*} obj2
 * @param {*} mixArr 0: extend array as object, 1: push into array, 2: replace all items
 */
export function extend(obj1, obj2, mixArr = 0) {
  const exists = []
  const extend = (obj1, obj2) => {
    each(obj2, (value, key) => {
      const originalValue = obj1[key]

      // check whether extended
      const exist = exists.find(item => item.e === value)
      if (exist) {
        if (originalValue === exist.o) {
          return
        }
        if (!originalValue || typeof originalValue !== 'object') {
          obj1[key] = exist.o
          return
        }
      }

      if (isObject(originalValue)) {
        if (isObject(value) || isArray(value)) {
          extend(originalValue, value, mixArr)
        }
        else {
          obj1[key] = value
        }
      }
      else if (isArray(originalValue)) {
        if (isObject(value)) {
          if (mixArr === 0 || mixArr === 1) {
            extend(originalValue, value, mixArr)
          }
          else if (mixArr === 2) {
            originalValue.length = 0
            extend(originalValue, value, mixArr)
          }
          else {
            obj1[key] = value
          }
        }
        else if (isArray(value)) {
          if (mixArr === 0) {
            extend(originalValue, value, mixArr)
          }
          else if (mixArr === 1) {
            originalValue.push(...value)
          }
          else if (mixArr === 2) {
            originalValue.length = 0
            originalValue.push(...value)
          }
          else {
            obj1[key] = value
          }
        }
        else {
          obj1[key] = value
        }
      }
      else {
        obj1[key] = value
      }
    })

    // record this pair
    exists.push({
      o: obj1, // original
      e: obj2, // extend by this
    })

    return obj1
  }
  return extend(obj1, obj2)
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
export function define(obj, key, value) {
  if (isFunction(value)) {
    return Object.defineProperty(obj, key, { get: value })
  }
  else if (isObject(value)) {
    if ('enumerable' in value || 'configurable' in value) {
      return Object.defineProperty(obj, key, value)
    }
    else if ((isFunction(value.set) && isFunction(value.get))) {
      return Object.defineProperty(obj, key, value)
    }
    else if ('value' in value) {
      return Object.defineProperty(obj, key, value)
    }
    else {
      return Object.defineProperty(obj, key, { value })
    }
  }
  else {
    return Object.defineProperty(obj, key, { value })
  }
}

/** */
export function flat(obj, determine) {
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
      if (!isUndefined(res)) {
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
      if (!isUndefined(res)) {
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
      return value
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
 * deep freeze
 * @param {*} o
 */
export function freeze(o) {
	if (!Object.freeze) {
		return o
	}

	Object.freeze(o)

	Object.getOwnPropertyNames(o).forEach((prop) => {
		const v = o[prop]
		if (
			Object.prototype.hasOwnProperty.call(o, prop)
			&& v !== null
			&& (typeof v === 'object' || typeof v === 'function')
			&& !Object.isFrozen(v)
		) {
			freeze(v)
		}
	})

	return o
}

/**
 * create a reactive object.
 * it will change your original data
 * @param {object|array} origin
 * @param {object} options
 * @param {function} options.get to modify output value of each node, receive (keyPath, reactiveValue), reactiveValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param {function} options.set to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param {function} options.dispatch to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param {function} options.writable whether be able to change value, return false to disable writable, default is true
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
 */
export function createReactive(origin, options = {}) {
  const { get, set, del, dispatch, writable } = options

  const create = (origin, parents = []) => {
    if (!isObject(origin) && !isArray(origin)) {
      return origin
    }

    let output = null
    if (isObject(origin)) {
      output = createObject(origin, parents)
    }
    else {
      output = createArray(origin, parents)
    }

    return output
  }

  const createObject = (origin, parents = []) => {
    const media = {}
    const reactive = {}

    const put = (key, value, trigger) => {
      const keyPath = [...parents, key]

      const setValue = (value, trigger) => {
        const prev = origin[key]
        const invalid = media[key]
        const input = isFunction(set) ? set(keyPath, value) : value

        let active
        let next
        if (inObject(key, media) && (
          value === prev
          || value === invalid
          || input === prev
          || input === invalid
        )) {
          next = prev
          active = invalid
        }
        else {
          next = input
          active = create(next, keyPath)
        }

        origin[key] = next
        media[key] = active

        if (trigger && isFunction(dispatch)) {
          dispatch({
            keyPath,
            value,
            next, active,
            prev, invalid,
          })
        }

        return active
      }

      Object.defineProperty(reactive, key, {
        get: () => {
          const active = media[key]
          const output = isFunction(get) ? get(keyPath, active) : active
          return output
        },
        set: (value) => {
          if (isFunction(writable) && !writable(keyPath, value)) {
            return media[key]
          }

          const active = setValue(value, true)
          return active
        },
        enumerable: true,
        configurable: true,
      })

      // initialize the current value at the first time
      const active = setValue(value, trigger)
      return active
    }

    each(origin, (value, key) => {
      put(key, value)
    })

    Object.defineProperties(reactive, {
      $get: {
        value: key => reactive[key],
      },
      $set: {
        value: (key, value) => put(key, value, true),
      },
      $del: {
        value: (key) => {
          const keyPath = [...parents, key]

          if (isFunction(writable) && !writable(keyPath)) {
            return
          }

          const prev = origin[key]
          const invalid = media[key]

          if (isFunction(del)) {
            del(keyPath)
          }

          delete reactive[key]
          delete media[key]
          delete origin[key]

          if (isFunction(dispatch)) {
            const none = void 0
            dispatch({
              keyPath,
              value: none,
              next: none,
              active: none,
              prev, invalid,
            }, isUndefined(prev))
          }
        },
      },
    })

    return reactive
  }

  const createArray = (origin, parents = []) => {
    const media = []
    const reactive = []

    // fill items into output array
    // start and end, where to start and end
    // items, original data to use
    const shuffle = (start, end) => {
      for (let i = start; i <= end; i ++) {
        const keyPath = [...parents, i]

        const setValue = (value, trigger) => {
          const prev = origin[i]
          const invalid = media[i]
          const input = isFunction(set) ? set(keyPath, value) : value

          let active
          let next
          if (inObject(i, media) && (
            value === prev
            || value === invalid
            || input === prev
            || input === invalid
          )) {
            next = prev
            active = invalid
          }
          else {
            next = input
            active = create(next, keyPath)
          }

          origin[i] = next
          media[i] = active

          if (trigger && isFunction(dispatch)) {
            dispatch({
              keyPath,
              value,
              next, active,
              prev, invalid,
            })
          }

          return active
        }

        Object.defineProperty(reactive, i, {
          get: () => {
            const active = media[i]
            const output = isFunction(get) ? get(keyPath, active) : active
            return output
          },
          set: (value) => {
            if (isFunction(writable) && !writable(keyPath, value)) {
              return media[i]
            }

            const active = setValue(value, true)
            return active
          },
          enumerable: true,
          configurable: true,
        })

        // initialize
        setValue(origin[i])
      }
    }

    // change array prototype methods
    const modify = (fn) => ({
      value: function(...args) {
        if (isFunction(writable) && !writable(parents, origin)) {
          if (fn === 'push' || fn === 'unshift') {
            return origin.length
          }
          else if (fn === 'splice') {
            return []
          }
          else if (fn === 'shift') {
            return origin[0]
          }
          else if (fn === 'pop') {
            return origin[origin.length - 1]
          }
          else {
            return origin
          }
        }

        // deal with original data
        const before = origin.length
        let output = Array.prototype[fn].apply(origin, args)
        const after = origin.length

        if (fn === 'push') {
          output = origin.length
          shuffle(before - 1, after - 1)
        }
        else if (fn === 'unshift') {
          output = origin.length
          shuffle(0, after - before - 1)
        }
        else if (fn === 'splice') {
          const [_start, _count, ...items] = args
          output = media[fn](...args)
          reactive.length = after

          // new items inserted
          if (items.length) {
            // find the index inserted at
            let index = -1
            for (let i = 0, len = media.length; i < len; i ++) {
              let matched = true
              for (let n = 0, l = items.length; n < l; n ++) {
                const o = media[i + n] // use media so that it should must equal origin items
                const t = items[n]
                if (o !== t) {
                  matched = false
                  break
                }
              }
              if (matched) {
                index = i
                break
              }
            }

            const start = index
            const end = start + items.length - 1

            shuffle(start, end)
          }
        }
        else if (inArray(fn, ['shift', 'pop'])) {
          output = media[fn](...args)
          reactive.length = after
        }
        else if (inArray(fn, ['sort', 'reverse', 'fill'])) {
          output = media[fn](...args)
        }

        if (isFunction(dispatch)) {
          dispatch({
            keyPath: parents,
            value: origin,
            next: origin,
            active: reactive,
            prev: origin,
            invalid: reactive,
          }, true)
        }

        return output
      },
    })

    Object.defineProperties(reactive, {
      push: modify('push'),
      unshift: modify('unshift'),
      splice: modify('splice'),
      pop: modify('pop'),
      shift: modify('shift'),
      sort: modify('sort'),
      reverse: modify('reverse'),
      fill: modify('fill'),
    })

    shuffle(0, origin.length - 1)

    return reactive
  }

  const output = create(origin)
  return output
}

/**
 * create a proxy object.
 * it will change your original data
 * @param {object|array} origin
 * @param {object} options
 * @param {function} options.get to modify output value of each node, receive (keyPath, proxiedValue), proxiedValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param {function} options.set to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param {function} options.dispatch to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param {function} options.writable whether be able to change value, return false to disable writable, default is true
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
 */
export function createProxy(origin, options = {}) {
  const { get, set, del, dispatch, writable } = options

  const create = (origin, parents = []) => {
    if (!isObject(origin) && !isArray(origin)) {
      return origin
    }

    let output = null
    if (isObject(origin)) {
      output = createObject(origin, parents)
    }
    else {
      output = createArray(origin, parents)
    }

    return output
  }

  const createObject = (origin, parents = []) => {
    const media = {}
    const proxy = new Proxy(media, {
      get: (target, key, receiver) => {
        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && key.description && key.description.indexOf('Symbol.') === 0) {
          return Reflect.get(target, key, receiver)
        }

        const active = Reflect.get(target, key, receiver)

        // here should be noticed
        // a Symbol key will not to into `get` option function
        if (isFunction(get) && !isSymbol(key)) {
          const keyPath = [...parents, key]
          const output = get(keyPath, active)
          return output
        }
        else {
          return active
        }
      },
      set: (target, key, value, receiver) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath, value)) {
          return true
        }

        const prev = origin[key]
        const invalid = media[key]
        const input = isFunction(set) ? set(keyPath, value) : value

        let active
        let next
        if (inObject(key, media) && (
          value === prev
          || value === invalid
          || input === prev
          || input === invalid
        )) {
          next = prev
          active = invalid
        }
        else {
          next = input
          active = create(next, keyPath)
        }

        origin[key] = next
        Reflect.set(target, key, active, receiver)

        if (isFunction(dispatch)) {
          dispatch({
            keyPath,
            value,
            next, active,
            prev, invalid,
          })
        }

        return true
      },
      deleteProperty: (target, key) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath)) {
          return true
        }

        const prev = origin[key]
        const invalid = media[key]

        if (isFunction(del) && !isSymbol(key)) {
          del(keyPath)
        }

        delete origin[key]
        Reflect.deleteProperty(target, key)

        if (isFunction(dispatch)) {
          const none = undefined
          dispatch({
            keyPath,
            value: none,
            next: none,
            active: none,
            prev, invalid,
          }, !isUndefined(prev))
        }

        return true
      },
    })

    each(origin, (value, key) => {
      const keyPath = [...parents, key]
      const next = isFunction(set) && !isSymbol(key) ? set(keyPath, value) : value

      origin[key] = next
      media[key] = create(next, keyPath)
    })

    return proxy
  }

  const createArray = (origin, parents = []) => {
    const media = []
    const proxy = new Proxy(media, {
      get: (target, key, receiver) => {
        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && key.description && key.description.indexOf('Symbol.') === 0) {
          return Reflect.get(target, key, receiver)
        }

        // array primitive operation
        const methods = [
          // the following 3 lines will change the array's length
          // the following 1 line will return the new length
          'push', 'unshift',
          // the following 1 line will return the spliced items array
          'splice',
          // the following 1 line will return the removed item value
          'shift', 'pop',
          // the following 1 line will return the changed original array
          'sort', 'reverse', 'fill',
        ]
        if (inArray(key, methods)) {
          return (...args) => {
            if (isFunction(writable) && !writable(parents, origin)) {
              if (key === 'push' || key === 'unshift') {
                return origin.length
              }
              else if (key === 'splice') {
                return []
              }
              else if (key === 'shift') {
                return origin[0]
              }
              else if (key === 'pop') {
                return origin[origin.length - 1]
              }
              else {
                return origin
              }
            }

            // change original data
            Array.prototype[key].apply(origin, args)

            const output = Array.prototype[key].apply(media, args.map(item => create(item, parents)))

            if (isFunction(dispatch)) {
              dispatch({
                keyPath: parents,
                value: origin,
                next: origin,
                active: proxy,
                prev: origin,
                invalid: proxy,
              }, true)
            }

            return output
          }
        }

        const keyPath = [...parents, key]
        const active = Reflect.get(target, key, receiver)

        // here should be noticed
        // a Symbol key will not to into `get` option function
        if (isFunction(get) && !isSymbol(key)) {
          const output = get(keyPath, active)
          return output
        }
        else {
          return active
        }
      },
      set: (target, key, value, receiver) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath, value)) {
          return true
        }

        // operate like media.length = 0
        if (key === 'length') {
          if (isFunction(writable) && !writable(parents, origin)) {
            return true
          }

          origin.length = value
          media.length = value

          if (isFunction(dispatch)) {
            dispatch({
              keyPath: parents,
              value: origin,
              next: origin,
              prev: origin,
              active: proxy,
            }, true)
          }

          return true
        }

        const prev = origin[key]
        const invalid = media[key]
        const input = isFunction(set) ? set(keyPath, value) : value

        let active
        let next
        if (inObject(key, media) && (
          value === prev
          || value === invalid
          || input === prev
          || input === invalid
        )) {
          next = prev
          active = invalid
        }
        else {
          next = input
          active = create(next, keyPath)
        }

        origin[key] = next
        Reflect.set(target, key, active, receiver)

        if (isFunction(dispatch)) {
          dispatch({
            keyPath,
            value,
            next, active,
            prev, invalid,
          })
        }

        return true
      },
      deleteProperty: (target, key) => {
        const keyPath = [...parents, key]

        if (isFunction(writable) && !writable(keyPath)) {
          return true
        }

        const prev = origin[key]
        const invalid = media[key]

        if (isFunction(del) && !isSymbol(key)) {
          del(keyPath)
        }

        delete origin[key]
        Reflect.defineProperty(target, key)

        if (isFunction(dispatch)) {
          const none = undefined
          dispatch({
            keyPath,
            value: none,
            next: none,
            active: none,
            prev, invalid,
          }, !isUndefined(prev))
        }

        return true
      },
    })

    origin.forEach((value, i) => {
      const keyPath = [...parents, i]
      const next = isFunction(set) && !isSymbol(i) ? set(keyPath, value) : value

      origin[i] = next
      media[i] = create(next, keyPath)
    })

    return proxy
  }

  const output = create(origin)
  return output
}
