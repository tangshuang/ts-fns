import { getStringHash } from './string.js'
import { isArray, isObject, isFile, isDate, isFunction, inArray, isSymbol, inObject, isUndefined, hasOwnKey } from './is.js'
import { decideby } from './syntax.js'

/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
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
 * @param {object} obj1
 * @param {object} obj2
 * @param {0|1|2} [mixArr] 0: extend array as object, 1: push into array, 2: replace all items
 * @returns {object} obj1
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

/**
 * @param {object} obj1
 * @param {object} obj2
 * @param {0|1|2} [mixArr] 0: extend array as object, 1: push into array, 2: replace all items
 * @returns {object} a new object
 */
export function merge(obj1, obj2, mixArr = 0) {
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
      if (isArray(obj2) && mixArr) {
        return mixArr === 1 ?  [...obj1, ...obj2] : obj2
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

/**
 * @param {object} obj
 * @returns {string}
 */
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

/**
 * @param {object} obj
 * @returns {number}
 */
export function getObjectHash(obj) {
  if (typeof obj !== 'object') {
    return
  }

  let str = stringify(obj)
  let hash = getStringHash(str)
  return hash
}

/**
 * @param {object} obj
 * @param {string} key
 * @param {object|function} descriptor
 * @returns {object}
 */
export function define(obj, key, descriptor) {
  if (isFunction(descriptor)) {
    return Object.defineProperty(obj, key, { get: descriptor })
  }
  else if (isObject(descriptor)) {
    if (hasOwnKey(descriptor, 'enumerable') || hasOwnKey(descriptor, 'configurable')) {
      return Object.defineProperty(obj, key, descriptor)
    }
    else if ((isFunction(descriptor.set) && isFunction(descriptor.get))) {
      return Object.defineProperty(obj, key, descriptor)
    }
    else if (hasOwnKey(descriptor, 'value')) {
      return Object.defineProperty(obj, key, descriptor)
    }
    else {
      return Object.defineProperty(obj, key, { value: descriptor })
    }
  }
  else {
    return Object.defineProperty(obj, key, { value: descriptor })
  }
}

/**
 * @param {object|array} obj
 * @param {function} [determine]
 * @returns {object}
 */
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

/**
 * @param {object|array} obj
 * @param {function} fn
 * @param {boolean} [descriptor]
 * @returns {object|array}
 */
export function each(obj, fn, descriptor) {
  const withDescriptor = () => {
    const descriptors = Object.getOwnPropertyDescriptors(obj)
    const keys = Object.keys(descriptors)
    keys.forEach((key) => {
      const descriptor = descriptors[key]
      const { get, set, enumerable, configurable, writable } = descriptor
      if (enumerable || (get || set) || (configurable && writable)) {
        fn(descriptor, key, obj)
      }
    })
  }

  const withIterator = () => {
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

  return descriptor ? withDescriptor() : withIterator()
}

/**
 * @param {object|array} obj
 * @param {function} fn
 * @returns {object}
 */
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

/**
 * @param {object|array} obj
 * @param {function} fn
 * @returns {object}
 */
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

/**
 * @param {object|array} obj
 * @param {function} fn
 */
export function iterate(obj, fn) {
  if (isArray(obj)) {
    let i = 0
    const next = () => {
      if (i >= obj.length) {
        return
      }
      const item = obj[i]
      fn(item, i, next)
    }
    next()
  }
  else {
    const keys = Object.keys(obj)
    let i = 0
    const next = () => {
      if (i >= keys.length) {
        return
      }
      const key = keys[i]
      const value = obj[key]
      fn(value, key, next)
    }
    next()
  }
}

/**
 * @param {object|array} obj
 * @param {Function} fn
 * @returns {any}
 */
export function search(obj, fn) {
  if (isArray(obj)) {
    for (let i = 0, len = obj.length; i < len; i ++) {
      const item = obj[i]
      const res = fn(item, i)
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

/**
 * 在对象中查找，fn返回true表示找到，返回false表示没有找到继续找，找到后返回该属性的key，通过key就可以方便的获取value
 * @param {object|array} obj
 * @param {function} fn
 * @returns {string} 返回key，找不到返回undefined
 */
export function find(obj, fn) {
  return search(obj, (value, key) => {
    const res = fn(value, key)
    if (res) {
      return key
    }
  })
}

/**
 * @param {object} obj
 * @param {array[]} keys
 * @returns {object}
 */
export function extract(obj, keys) {
  const results = {}
  keys.forEach((key) => {
    if (hasOwnKey(obj, key)) {
      results[key] = obj[key]
    }
  })
  return results
}

/**
 * @alias extract
 * @param {object} obj
 * @param {string[]} keys
 * @returns {object}
 */
export function pick(obj, keys) {
  return extract(obj, keys);
}

/**
 * deep freeze
 * @param {object} o
 * @returns {object}
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
 * @param {function} options.disable return true to disable create nest reactive on this node
 * @returns {object|array}
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
  const { get, set, del, dispatch, writable, disable, receive } = options

  const create = (origin, parents = []) => {
    if (!isObject(origin) && !isArray(origin)) {
      return origin
    }

    if (isFunction(disable) && disable(parents, origin)) {
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

    const setValue = (key, value, trigger) => {
      const keyPath = [...parents, key]

      if (Object.isFrozen(origin)) {
        const active = create(value, keyPath)
        return active
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
        // origin property is changed any where else
        if ((typeof prev !== 'object' || prev === null) && prev !== invalid) {
          next = prev
          active = prev
        }
        else if (invalid && typeof invalid === 'object' && invalid.$$_ORIGIN !== prev) {
          next = prev
          active = create(prev, keyPath)
        }
        else {
          next = prev
          active = invalid
        }
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

    const delValue = (key, trigger) => {
      const keyPath = [...parents, key]
      const prev = origin[key]
      const invalid = media[key]

      if (isFunction(del)) {
        del(keyPath)
      }

      delete reactive[key]
      delete media[key]
      delete origin[key]

      if (trigger && isFunction(dispatch)) {
        const none = void 0
        dispatch({
          keyPath,
          value: none,
          next: none,
          active: none,
          prev, invalid,
        }, isUndefined(prev))
      }
    }

    const put = (key, value, trigger) => {
      const keyPath = [...parents, key]

      Object.defineProperty(reactive, key, {
        get: () => {
          const active = media[key]
          const output = isFunction(get) ? get(keyPath, active) : active
          return output
        },
        set: (value) => {
          if (isFunction(receive)) {
            receive(keyPath, value)
          }

          if (Object.isFrozen(origin)) {
            return media[key]
          }

          if (isFunction(writable) && !writable(keyPath, value)) {
            return media[key]
          }

          const descriptor = Object.getOwnPropertyDescriptor(media, key)
          if (descriptor) {
            if (!('value' in descriptor)) {
              if ('set' in descriptor) {
                origin[key] = value
              }
              return value
            }
            if (!descriptor.writable) {
              return descriptor.value
            }
          }

          const active = setValue(key, value, true)
          return active
        },
        enumerable: true,
        configurable: true,
      })

      // initialize the current value at the first time
      const active = setValue(key, value, trigger)
      return active
    }

    each(origin, (descriptor, key) => {
      if ('value' in descriptor) {
        const value = descriptor.value
        put(key, value)
      }
      else {
        Object.defineProperty(media, key, descriptor)
      }
    }, true)

    Object.defineProperties(reactive, {
      $get: {
        value: key => reactive[key],
      },
      $set: {
        value: (key, value) => {
          const keyPath = [...parents, key]

          if (isFunction(receive)) {
            receive(keyPath, value)
          }

          if (Object.isFrozen(origin)) {
            return media[key]
          }

          if (isFunction(writable) && !writable(keyPath)) {
            return media[key]
          }

          const descriptor = Object.getOwnPropertyDescriptor(media, key)
          if (descriptor) {
            if (!('value' in descriptor)) {
              if ('set' in descriptor) {
                origin[key] = value
              }
              return value
            }
            if (!descriptor.writable) {
              return descriptor.value
            }
          }

          const active = inObject(key, reactive) ? setValue(key, value, true) : put(key, value, true)
          return active
        },
      },
      $del: {
        value: (key) => {
          const keyPath = [...parents, key]

          if (isFunction(receive)) {
            receive(keyPath)
          }

          if (Object.isFrozen(origin)) {
            return false
          }

          if (isFunction(writable) && !writable(keyPath)) {
            return false
          }

          const descriptor = Object.getOwnPropertyDescriptor(media, key)
          if (!descriptor) {
            return false
          }
          if (!descriptor.configurable) {
            return false
          }

          delValue(key, true)
          return true
        },
      },
      $$_ORIGIN: {
        get: () => origin,
      },
    })

    return reactive
  }

  const createArray = (origin, parents = []) => {
    const media = []
    const reactive = []

    const setValue = (i, value, trigger) => {
      const keyPath = [...parents, i]

      if (Object.isFrozen(origin)) {
        const active = create(value, keyPath)
        return active
      }

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
        // origin property is changed any where else
        if ((typeof prev !== 'object' || prev === null) && prev !== invalid) {
          next = prev
          active = prev
        }
        else if (invalid && typeof invalid === 'object' && invalid.$$_ORIGIN !== prev) {
          next = prev
          active = create(prev, keyPath)
        }
        else {
          next = prev
          active = invalid
        }
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

    // fill items into output array
    // start and end, where to start and end
    // items, original data to use
    const shuffle = (start, end) => {
      for (let i = start; i <= end; i ++) {
        const keyPath = [...parents, i]

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

            const descriptor = Object.getOwnPropertyDescriptor(media, i)
            if (descriptor) {
              if (!('value' in descriptor)) {
                if ('set' in descriptor) {
                  origin[i] = value
                }
                return value
              }
              if (!descriptor.writable) {
                return descriptor.value
              }
            }

            const active = setValue(i, value, true)
            return active
          },
          enumerable: true,
          configurable: true,
        })

        // initialize
        setValue(i, origin[i])
      }

      // make sure the no use items are removed
      if (media.length > origin.length) {
        media.length = origin.length
      }
      if (reactive.length > media.length) {
        reactive.length = media.length
      }
    }

    // change array prototype methods
    const modify = (fn) => ({
      value: function(...args) {
        const nonAs = () => {
          if (fn === 'push' || fn === 'unshift') {
            return media.length
          }
          else if (fn === 'splice') {
            return []
          }
          else if (fn === 'shift') {
            return media[0]
          }
          else if (fn === 'pop') {
            return media[media.length - 1]
          }
          else if (fn === 'insert' || fn === 'remove') {
            return -1
          }
          else {
            return media
          }
        }

        if (isFunction(receive)) {
          receive(parents, origin, fn, args)
        }

        if (Object.isFrozen(origin)) {
          return nonAs()
        }

        if (isFunction(writable) && !writable(parents, origin)) {
          return nonAs()
        }

        // a hook to modify args for array push, shift inputs
        if (inObject(fn, options) && isFunction(options[fn])) {
          const res = options[fn](parents, args)
          // when return false, it means don't change the value
          if (res === false) {
            return nonAs()
          }
          // when return array, use it as new args
          if (isArray(res)) {
            args = res
          }
          // when return object, switch to another method
          else if (isObject(res)) {
            const { to, args: newArgs } = res
            fn = to
            args = newArgs
          }
        }

        let output = null

        // deal with original data
        const operate = () => {
          const before = origin.length
          output = Array.prototype[fn].apply(origin, args)
          const after = origin.length
          return [after, before]
        }

        if (fn === 'push') {
          const [after, before] = operate()
          output = after
          media.length = after
          reactive.length = after
          shuffle(before - 1, after - 1)
        }
        else if (fn === 'unshift') {
          const [after] = operate()
          output = after
          media.length = after
          reactive.length = after
          shuffle(0, after - 1)
        }
        else if (fn === 'splice') {
          const [after] = operate()

          const [start, len, ...items] = args
          output = media.slice(start, start + len)

          media.length = after
          reactive.length = after

          if (!items.length) {
            shuffle(start, after - 1)
          }
          else if (len === items.length) {
            shuffle(start, start + len - 1)
          }
          else {
            shuffle(start, after - 1)
          }
        }
        else if (fn === 'shift') {
          const [after] = operate()
          output = media[0]
          media.length = after
          reactive.length = after
          shuffle(0, after - 1)
        }
        else if (fn === 'pop') {
          const [after] = operate()
          output = media[media.length - 1]
          media.length = after
          reactive.length = after
        }
        else if (fn === 'fill') {
          const [, before] = operate()
          const [, start = 0, end = before] = args
          output = media
          shuffle(start, end - 1)
        }
        else if (fn === 'insert') {
          if (args.length < 1) {
            return -1
          }
          else if (args.length < 2) {
            const [item] = args
            output = origin.length
            Array.prototype.push.call(origin, item)
            shuffle(output, output)
          }
          else {
            const [item, before] = args
            const beforeIndex = decideby(() => {
              const mediaIndex = media.indexOf(before)
              if (mediaIndex > -1) {
                return mediaIndex
              }

              const originIndex = origin.indexOf(before)
              return originIndex
            })

            if (beforeIndex < 0) {
              return -1
            }

            Array.prototype.splice.call(origin, beforeIndex, 0, item)
            shuffle(beforeIndex, origin.length - 1)
            output = beforeIndex
          }
        }
        else if (fn === 'remove') {
          if (args.length < 1) {
            return -1
          }
          else {
            const [item] = args
            const index = decideby(() => {
              const mediaIndex = media.indexOf(item)
              if (mediaIndex > -1) {
                return mediaIndex
              }

              const originIndex = origin.indexOf(item)
              return originIndex
            })

            if (index < 0) {
              return index
            }

            Array.prototype.splice.call(origin, index, 1)
            Array.prototype.splice.call(media, index, 1)
            shuffle(index, origin.length - 1)
            output = index
          }
        }
        else {
          operate()
          output = media
        }

        if (isFunction(dispatch)) {
          dispatch({
            keyPath: parents,
            value: origin,
            next: origin,
            active: reactive,
            prev: origin,
            invalid: reactive,
            fn,
            result: output,
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
      insert: modify('insert'),
      remove: modify('remove'),
      $$_ORIGIN: {
        get: () => origin,
      },
    })

    shuffle(0, origin.length - 1)

    return reactive
  }

  const output = create(origin)
  return output
}

const ProxySymbol = Symbol('Proxy')
/**
 * create a proxy object.
 * it will change your original data
 * @param {object|array} origin
 * @param {object} options
 * @param {function} options.get to modify output value of each node, receive (keyPath, proxiedValue), proxiedValue is a reactive object/array as if, keyPath is an array which catains keys in path
 * @param {function} options.set to modify input value of each node, receive (keyPath, nextValue), nextValue is the given passed value, the return value will be transformed to be reactive object/array as if
 * @param {function} options.dispatch to notify change with keyPath, receive (keypath, next, prev), it will be called after value is set into
 * @param {function} options.writable whether be able to change value, return false to disable writable, default is true
 * @returns {any}
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
  const { get, set, del, dispatch, writable, disable, receive, extensible, enumerable } = options

  const create = (origin, parents = []) => {
    if (!isObject(origin) && !isArray(origin)) {
      return origin
    }

    if (isFunction(disable) && disable(parents, origin)) {
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
        // get original property value
        if (isSymbol(key) && key === ProxySymbol) {
          return origin
        }

        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && getSymbolContent(key).indexOf('Symbol.') === 0) {
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

        if (isFunction(receive)) {
          receive(keyPath, value)
        }

        if (Object.isFrozen(origin)) {
          return true
        }

        if (isFunction(writable) && !writable(keyPath, value)) {
          return true
        }

        const descriptor = Object.getOwnPropertyDescriptor(media, key)
        if (descriptor) {
          if (!('value' in descriptor)) {
            if ('set' in descriptor) {
              origin[key] = value
            }
            return true
          }
          if (!descriptor.writable) {
            return true
          }
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

        if (isFunction(receive)) {
          receive(keyPath)
        }

        if (Object.isFrozen(origin)) {
          return true
        }

        if (isFunction(writable) && !writable(keyPath)) {
          return true
        }

        const descriptor = Object.getOwnPropertyDescriptor(media, key)
        if (!descriptor) {
          return true
        }
        if (!descriptor.configurable) {
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
      has(target, key) {
        if (isFunction(enumerable)) {
          const keyPath = [...parents, key]
          return enumerable(keyPath)
        }
        return key in target
      },
      isExtensible() {
        const keyPath = [...parents]
        if (isFunction(extensible)) {
          return extensible(keyPath)
        }
        return true
      },
    })

    each(origin, (descriptor, key) => {
      if ('value' in descriptor) {
        const value = descriptor.value
        const keyPath = [...parents, key]

        if (Object.isFrozen(origin)) {
          media[key] = create(value, keyPath)
        }
        else {
          const needRewrite = isFunction(set) && !isSymbol(key)
          const next = needRewrite ? set(keyPath, value) : value

          if (needRewrite) {
            origin[key] = next
          }

          media[key] = create(next, keyPath)
        }
      }
      else {
        Object.defineProperty(media, key, descriptor)
      }
    }, true)

    return proxy
  }

  const createArray = (origin, parents = []) => {
    const media = []
    const proxy = new Proxy(media, {
      get: (target, key, receiver) => {
        // get original property value
        if (isSymbol(key) && key === ProxySymbol) {
          return origin
        }

        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && getSymbolContent(key).indexOf('Symbol.') === 0) {
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
          // provided method
          'insert', 'remove',
        ]
        if (inArray(key, methods)) {
          return (...args) => {
            const nonAs = () => {
              if (key === 'push' || key === 'unshift') {
                return origin.length
              }
              else if (key === 'splice') {
                return []
              }
              else if (key === 'shift') {
                return media[0]
              }
              else if (key === 'pop') {
                return media[origin.length - 1]
              }
              else if (key === 'insert') {
                return -1
              }
              else {
                return media
              }
            }

            if (isFunction(receive)) {
              receive(parents, origin, key, args)
            }

            if (Object.isFrozen(origin)) {
              return nonAs()
            }

            if (isFunction(writable) && !writable(parents, origin)) {
              return nonAs()
            }

            // a hook to modify args for array push, shift inputs
            if (inObject(key, options) && isFunction(options[key])) {
              const res = options[key](parents, args)
              // when return false, it means don't change the value
              if (res === false) {
                return nonAs()
              }
              // when return array, use it as new args
              if (isArray(res)) {
                args = res
              }
              // when return object, switch to another method
              else if (isObject(res)) {
                const { to, args: newArgs } = res
                key = to
                args = newArgs
              }
            }

            const max = origin.length
            let output = null

            // create sub children
            if (key === 'push') {
              // change original data
              Array.prototype[key].apply(origin, args)

              const medias = args.map((item, i) => {
                const index = max + i
                return create(item, [...parents, index])
              })
              output = Array.prototype.push.apply(media, medias)
            }
            else if (key === 'splice') {
              // change original data
              Array.prototype[key].apply(origin, args)

              const [start, len, ...items] = args
              if (!items.length) {
                output = Array.prototype.splice.call(media, start, len)
              }
              else if (len === items.length) {
                const medias = items.map((item, i) => {
                  const index = start + i
                  return create(item, [...parents, index])
                })
                const params = [start, len, ...medias]
                output = Array.prototype.splice.apply(media, params)
              }
              // the ones which are right in media will be changed
              else {
                output = media.slice(start, start + len)

                const items = origin.slice(start)
                const medias = items.map((item, i) => {
                  const index = start + i
                  return create(item, [...parents, index])
                })
                const params = [start, origin.length, ...medias]
                Array.prototype.splice.apply(media, params)
              }
            }
            else if (key === 'fill') {
              // change original data
              Array.prototype[key].apply(origin, args)

              const [item, start = 0, end = max] = args
              const items = []
              for (let i = start; i < end; i ++) {
                items.push(create(item, [...parents, i]))
              }
              const params = [start, end - start, items]
              Array.prototype.splice.apply(media, params)
              output = media
            }
            else if (key === 'insert') {
              if (args.length < 1) {
                return -1
              }
              else if (args.length < 2) {
                const [item] = args
                output = origin.length
                Array.prototype.push.call(origin, item)
                Array.prototype.push.call(media, item)
              }
              else {
                const [item, before] = args
                const beforeIndex = decideby(() => {
                  const mediaIndex = media.indexOf(before)
                  if (mediaIndex > -1) {
                    return mediaIndex
                  }

                  const originIndex = origin.indexOf(before)
                  return originIndex
                })

                if (beforeIndex < 0) {
                  return -1
                }

                Array.prototype.splice.call(origin, beforeIndex, 0, item)
                Array.prototype.splice.call(media, beforeIndex, 0, item)
                output = beforeIndex
              }
            }
            else if (key === 'remove') {
              const [item] = args
              const index = decideby(() => {
                const mediaIndex = media.indexOf(item)
                if (mediaIndex > -1) {
                  return mediaIndex
                }

                const originIndex = origin.indexOf(item)
                return originIndex
              })

              if (index < 0) {
                return index
              }

              Array.prototype.splice.call(origin, index, 1)
              Array.prototype.splice.call(media, index, 1)
              output = index
            }
            else {
              // change original data
              Array.prototype[key].apply(origin, args)
              output = Array.prototype[key].apply(media, args)
            }

            if (isFunction(dispatch)) {
              dispatch({
                keyPath: parents,
                value: origin,
                next: origin,
                active: proxy,
                prev: origin,
                invalid: proxy,
                fn: key,
                result: output,
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

        if (isFunction(receive)) {
          receive(keyPath, value)
        }

        if (Object.isFrozen(origin)) {
          return true
        }

        if (isFunction(writable) && !writable(keyPath, value)) {
          return true
        }

        const descriptor = Object.getOwnPropertyDescriptor(media, key)
        if (descriptor) {
          if (!('value' in descriptor)) {
            if ('set' in descriptor) {
              origin[key] = value
            }
            return true
          }
          if (!descriptor.writable) {
            return true
          }
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

        if (isFunction(receive)) {
          receive(keyPath)
        }

        if (Object.isFrozen(origin)) {
          return true
        }

        if (isFunction(writable) && !writable(keyPath)) {
          return true
        }

        const descriptor = Object.getOwnPropertyDescriptor(media, key)
        if (!descriptor) {
          return true
        }
        if (!descriptor.configurable) {
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
      has(target, key) {
        if (inArray(key, ['remove', 'insert'])) {
          return true
        }
        if (isFunction(enumerable)) {
          const keyPath = [...parents, key]
          return enumerable(keyPath)
        }
        return key in target
      },
      isExtensible() {
        if (isFunction(extensible)) {
          const keyPath = [...parents]
          return extensible(keyPath)
        }
        return true
      },
    })

    each(origin, (descriptor, i) => {
      if ('value' in descriptor) {
        const value = descriptor.value
        const keyPath = [...parents, i]

        if (Object.isFrozen(origin)) {
          media[i] = create(value, keyPath)
        }
        else {
          const needRewrite = isFunction(set) && !isSymbol(i)
          const next = needRewrite ? set(keyPath, value) : value

          if (needRewrite) {
            origin[i] = next
          }

          media[i] = create(next, keyPath)
        }
      }
      else {
        Object.defineProperty(media, key, descriptor)
      }
    }, true)

    return proxy
  }

  const output = create(origin)
  return output
}

/**
 * determine whether an object is a Proxy
 * @param {any} value
 * @returns {boolean}
 */
export function isProxy(value) {
  return !!(value && value[ProxySymbol])
}

/**
 * refine the original value from a Proxy
 * @param {object} obj
 * @returns {any}
 */
export function refineProxy(obj) {
  return obj ? obj[ProxySymbol] : void 0
}

/**
 * get the string of a symbol
 * @param {symbol} symb
 * @returns {string}
 */
export function getSymbolContent(symb) {
  if (symb.description) {
    return symb.description
  }
  const str = symb.toString()
  return str.substring(7, str.length - 1)
}

/**
 * convert an object to an entry array
 * @param {object} obj
 * @returns {array[]}
 */
export function toEntries(obj) {
  const keys = Object.keys(obj)
  return keys.map(key => [key, obj[key]])
}

/**
 * conver an entry/key-value array to an object
 * @param {array[] | object[]} entries
 * @param {boolean} kv
 * @returns {object}
 */
export function fromEntries(entries, kv = false) {
  const obj = {}
  entries.forEach((item) => {
    if (kv) {
      const { key, value } = item
      obj[key] = value
    }
    else {
      const [key, value] = item
      obj[key] = value
    }
  })
  return obj
}
