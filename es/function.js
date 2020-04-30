/**
 * @module function
 */

import { getObjectHash, each } from './object.js'

/**
 * Create a function which cache result by parameters.
 * @param {function} fn the original function to calculate result
 * @param {number} expire the time to expire cache, if set 0 (or not set), the cache will never be expired, default 0.
 * @return {function} you can call a .clear() method on this function to clear the cache
 * @example const compute = compute_((x, y) => {
 *   return x + y
 * })
 *
 * // the following two computing will call original fn only once
 * const a = compute(1, 3)
 * const b = compute(1, 3)
 *
 * compute.clear() // clear all cache
 */
export function compute_(fn, expire = 0) {
  let cache = {}

  const clear = () => {
    cache = {}
  }

  const recycle = () => {
    if (!expire) {
      return
    }

    setTimeout(() => {
      each(cache, ({ time }, key) => {
        if (time + expire <= Date.now()) {
          delete cache[key]
        }
      })
    }, expire)
  }

  const compute = function(...args) {
    const hash = getObjectHash(args)

    if (hash in cache) {
      const item = cache[hash]
      const { time, result } = item
      if (!expire || (time + expire > Date.now())) {
        return result
      }
    }

    recycle()

    const result = fn.apply(this, args)
    const time = Date.now()
    cache[hash] = { result, time }

    return result
  }

  compute.clear = clear

  return compute
}

/**
 * create a getter function which will cache the result, cache will be released automaticly
 * @param {function} fn the getter function, notice, without parameters
 * @param {number} type the type of automatic releasing, default 1.
 *  - 0: never released
 *  - 1: in Promise microtask
 *  - 2: in timeout task
 *  - 3: in requestAnimationFrame
 *  - 4: in requestIdleCallback
 * @return {function} you can call .clear() to clear cache immediately
 * @example const get = get_(() => {
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
 */
export function get_(fn, type = 1) {
  let iscalling = false
  let cache = null

  const clear = () => {
    iscalling = false
    cache = null
  }

  const recycle = () => {
    if (type === 1) {
      Promise.resolve().then(clear)
    }
    else if (type === 2) {
      setTimeout(clear, 0)
    }
    else if (type === 3) {
      requestAnimationFrame(clear)
    }
    else if (type === 4) {
      requestIdleCallback(clear)
    }
  }

  const get = function() {
    if (iscalling) {
      return cache
    }

    recycle()

    const result = fn.call(this)

    iscalling = true
    cache = result

    return result
  }

  get.clear = clear

  return get
}

/**
 * Create a function which return a Promise and cached by parameters.
 * @param {function} fn a function, can be async function or normal function
 * @param {number} expire the expire time for releasing cache
 * @return {function} .clear() is available
 * @example const fn = async_(async () => {})
 *
 * const a = fn()
 * const b = fn()
 *
 * a === b // the same Promise
 */
export function async_(fn, expire = 0) {
  let cache = {}

  const clear = () => {
    cache = {}
  }

  const recycle = () => {
    if (!expire) {
      return
    }

    setTimeout(() => {
      each(cache, ({ time }, key) => {
        if (time + expire <= Date.now()) {
          delete cache[key]
        }
      })
    }, expire)
  }

  const asyncFn = function(...args) {
    const hash = getObjectHash(args)

    if (hash in cache) {
      const item = cache[hash]
      const { time, deferer } = item
      if (!expire || (time + expire > Date.now())) {
        return deferer
      }
    }

    recycle()

    const deferer = new Promise((resolve, reject) => {
      Promise.resolve().then(() => fn.apply(this, args)).then(resolve).catch(reject).finally(() => {
        if (expire > 0) {
          return
        }
        delete cache[hash]
      })
    })
    const time = Date.now()
    cache[hash] = { deferer, time }

    return deferer
  }

  asyncFn.clear = clear

  return asyncFn
}

/**
 * create a function whose result will be cached, and the cache will be released by invoke count
 * @param {function} fn
 * @param {number} count
 * @param {number} expire the expire time after latest invoke
 * @return {function} .clear() is avaliable
 * @example const invoke = invoke_(() => {
 *   return Math.random()
 * }, 2)
 *
 * const a = invoke()
 * const b = invoke()
 * const c = invoke()
 *
 * a === b
 * a !== c
 */
export function invoke_(fn, count = 1, expire = 0) {
  let cache = {}

  const clear = () => {
    cache = {}
  }

  const recycle = () => {
    if (!expire) {
      return
    }

    setTimeout(() => {
      each(cache, ({ time }, key) => {
        if (time + expire <= Date.now()) {
          delete cache[key]
        }
      })
    }, expire)
  }

  const invoke = function(...args) {
    const hash = getObjectHash(args)

    if (hash in cache) {
      const item = cache[hash]
      const { time, invoked, result } = item
      if (invoked >= count) {
        delete cache[hash]
      }
      else if (!expire || (time + expire > Date.now())) {
        item.invoked ++
        item.time = Date.now()
        return result
      }
    }

    recycle()

    const result = fn.apply(this, args)
    const time = Date.now()
    cache[hash] = { result, invoked: 1, time }

    return result
  }

  invoke.clear = clear

  return invoke
}

/**
 * @example const pipe = pipe_(
 *   x => x + 1,
 *   x => x - 1,
 *   x => x * x,
 *   x => x / x,
 * )
 *
 * const y = pipe(10) // 10
 */
export function pipe_(...fns) {
  const funcs = fns.filter(fn => typeof fn === 'function')
  return function(arg) {
    let result = arg
    for (let i = 0, len = funcs.length; i < len; i ++) {
      const fn = funcs[i]
      result = fn.call(this, result)
    }
    return result
  }
}
