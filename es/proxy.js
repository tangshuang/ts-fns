/**
 * @module proxy
 */

import { makeKeyPath } from './key-path.js'
import { isFunction, isObject, isArray, isSymbol } from './is.js'

const PROXY_TARGET = Symbol.for('[[Target]]')

const createProxyObject = (obj, options = {}, parents = []) => {
  const { get, set, del } = options
  const handler = {
    get(target, key, receiver) {
      if (key === PROXY_TARGET) {
        return getProxied(target)
      }

      // primitive property
      // such as 'a' + obj, and obj[Symbol.toPrimitive](hint) defined
      if (isSymbol(key) && key.description && key.description.indexOf('Symbol.') === 0) {
        return Reflect.get(target, key, receiver)
      }

      const chain = [...parents, key]
      let value

      // here should be noticed
      // a Symbol key will not to into `get` option function
      if (isFunction(get) && !isSymbol(key)) {
        const keyPath = makeKeyPath(chain)
        value = get([obj, keyPath], [target, key, receiver])
      }
      else {
        value = Reflect.get(target, key, receiver)
      }

      // if sub value is an object, return an proxy again
      if ((isObject(value) || isArray(value)) && !value[PROXY_TARGET]) {
        const proxy = createProxyObject(value, options, chain)
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
        const chain = [...parents, key]
        const keyPath = makeKeyPath(chain)
        const needto = set([obj, keyPath, v], [target, key, value, receiver])
        if (needto) {
          Reflect.set(target, key, v, receiver)
        }
        return true
      }
      else {
        return Reflect.set(target, key, v, receiver)
      }
    },
    deleteProperty(target, key) {
      if (isFunction(del) && !isSymbol(key)) {
        const chain = [...parents, key]
        const keyPath = makeKeyPath(chain)
        const needto = del([obj, keyPath], [target, key])
        if (needto) {
          Reflect.deleteProperty(target, key)
        }
        return true
      }
      else {
        return Reflect.deleteProperty(target, key)
      }
    },
  }
  return new Proxy(obj, handler)
}

/**
 * create a proxy object/array
 * @notice there should no Symbol in keyPath, or it will not work and return the original value
 * @param {object|array} obj
 * @param {object} options {
 *   // not working on Symbol properties
 *   // params are which received by getter, setter, deleteProperty, always contains [target, key, value, receiver]
 *   // keyPath, string to query nested property
 *   get([obj, keyPath], params) {},
 *   set([obj, keyPath, value], params) {},
 *   del([obj, keyPath], params) {},
 * }
 */
export function createProxy(obj, options = {}) {
  const proxy = createProxyObject(obj, options)
  return proxy
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
