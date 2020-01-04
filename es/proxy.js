/**
 * @module proxy
 */

import { makeKeyPath } from './key-path.js'
import { isFunction, isObject, isArray, isSymbol } from './is.js'

const PROXY_TARGET = /*#__PURE__*/Symbol.for('[[Target]]')

/**
 * create a proxy object/array
 * @notice there should no Symbol in keyPath, or it will not work and return the original value
 * @param {object|array} obj
 * @param {object} options {
 *   // not working on Symbol properties
 *   // can use this.rootTarget, this.rootProxy, this.keyChain, this.keyPath
 *   get(context, params) {},
 *   set(context, params) {},
 *   del(context, params) {},
 * }
 */
export function createProxy(rootTarget, options = {}) {
  let rootProxy = null
  const createProxyObject = (obj, options = {}, parents = []) => {
    const { get, set, del } = options
    const proxy = new Proxy(obj, {
      get(target, key, receiver) {
        if (key === PROXY_TARGET) {
          return getProxied(target)
        }

        // primitive property
        // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
        if (isSymbol(key) && key.description && key.description.indexOf('Symbol.') === 0) {
          return Reflect.get(target, key, receiver)
        }

        const keyChain = [...parents, key]
        let value

        // here should be noticed
        // a Symbol key will not to into `get` option function
        if (isFunction(get) && !isSymbol(key)) {
          const keyPath = makeKeyPath(keyChain)
          const context = {
            rootTarget,
            rootProxy,
            keyChain,
            keyPath,
            target,
            key,
            receiver,
          }
          value = get(context, [target, key, receiver])
        }
        else {
          value = Reflect.get(target, key, receiver)
        }

        // if sub value is an object, return an proxy again
        if ((isObject(value) || isArray(value)) && !value[PROXY_TARGET]) {
          const proxy = createProxyObject(value, options, keyChain)
          return proxy
        }
        else {
          return value
        }
      },
      set(target, key, value, receiver) {
        // return original data if value is a proxy
        const v = value && typeof value === 'object' ? getProxied(value) : value

        if (isFunction(set) && !isSymbol(key)) {
          const keyChain = [...parents, key]
          const keyPath = makeKeyPath(keyChain)
          const context = {
            rootTarget,
            rootProxy,
            keyChain,
            keyPath,
            target,
            key,
            value,
            receiver,
          }
          const needto = set(context, [target, key, value, receiver])
          if (needto) {
            return Reflect.set(target, key, v, receiver)
          }
          return true
        }
        else {
          return Reflect.set(target, key, v, receiver)
        }
      },
      deleteProperty(target, key) {
        if (isFunction(del) && !isSymbol(key)) {
          const keyChain = [...parents, key]
          const keyPath = makeKeyPath(keyChain)
          const context = {
            rootTarget,
            rootProxy,
            keyChain,
            keyPath,
            target,
            key,
          }
          const needto = del(context, [target, key])
          if (needto) {
            return Reflect.deleteProperty(target, key)
          }
          return true
        }
        else {
          return Reflect.deleteProperty(target, key)
        }
      },
    })
    return proxy
  }
  rootProxy = createProxyObject(rootTarget, options)
  return rootProxy
}

/**
 * get original object which is porxied by createProxy
 * @param {Proxy} proxy
 */
export function getProxied(proxy) {
  const target = proxy[PROXY_TARGET] ? proxy[PROXY_TARGET] : proxy
  // make sure to return original object
  if (target[PROXY_TARGET]) {
    return getProxied(target)
  }
  return target
}
