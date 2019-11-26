/**
 * @module proxy
 */

import { makeKeyPath } from './key-path.js'
import { isFunction, isObject, isArray } from './is.js'

export const PROXY_TARGET = Symbol.for('[[Target]]')

const createProxyObject = (obj, options = {}, parents = []) => {
  const { get, set, del } = options
  const handler = {
    get(target, key, receiver) {
      if (key === PROXY_TARGET) {
        return getProxied(target)
      }

      let value

      if (isFunction(get)) {
        const chain = [ ...parents, key ]
        const keyPath = makeKeyPath(chain)
        value = get([obj, keyPath, receiver], [target, key, receiver])
      }
      else {
        value = Reflect.get(target, key, receiver)
      }

      // if sub value is an object, return an proxy again
      if ((isObject(value) || isArray(value)) && !value[PROXY_TARGET]) {
        const proxy = createProxyObject(value, options, [ ...parents, key ])
        return proxy
      }
      else {
        return value
      }
    },
    set(target, key, value, receiver) {
      // return original data if value is a proxy
      const v = value && typeof value === 'object' ? getProxied(value) : value

      if (isFunction(set)) {
        const chain = [ ...parents, key ]
        const keyPath = makeKeyPath(chain)
        const needto = set([obj, keyPath, v, receiver], [target, key, v, receiver])
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
      if (isFunction(del)) {
        const chain = [ ...parents, key ]
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

/** */
export function createProxy(obj, options = {}) {
  const proxy = createProxyObject(obj, options)
  return proxy
}

/** */
export function getProxied(proxy) {
  const target = proxy[PROXY_TARGET] ? proxy[PROXY_TARGET] : proxy
  // make sure to return original object
  if (target[PROXY_TARGET]) {
    return getProxied(target)
  }
  return target
}
