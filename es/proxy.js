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
        return target
      }

      const value = Reflect.get(target, key, receiver)
      let use

      if (isObject(value) || isArray(value)) {
        const proxy = createProxyObject(value, options, [ ...parents, key ])
        use = proxy
      }
      else {
        use = value
      }

      if (isFunction(get)) {
        const chain = [ ...parents, key ]
        const keyPath = makeKeyPath(chain)
        return get([obj, keyPath, use], [target, key, value], receiver)
      }
      else {
        return use
      }
    },
    set(target, key, value, receiver) {
      // return original data if value is a proxy
      const v = value && typeof value === 'object' ? getProxied(value) : value

      if (isFunction(set)) {
        const chain = [ ...parents, key ]
        const keyPath = makeKeyPath(chain)
        const needto = set([obj, keyPath, v], [target, key, v], receiver)
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
export function getProxied(value) {
  const target = value[PROXY_TARGET] ? value[PROXY_TARGET] : value
  return target
}
