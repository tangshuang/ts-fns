import { makeKeyPath } from './key-path.js'
import { isFunction, isObject, isArray } from './is.js'

export function createProxy(obj, options = {}) {
  const { get, set, del } = options
  const createProxy = (obj, parents = []) => {
    const handler = {
      get(target, key, receiver) {
        if (key === Symbol.for('[[Target]]')) {
          return target
        }

        const value = Reflect.get(target, key, receiver)
        let use

        if (isObject(value) || isArray(value)) {
          const proxy = createProxy(value, [ ...parents, key ])
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
        if (isFunction(set)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPath(chain)
          const needto = set([obj, keyPath, value], [target, key, value], receiver)
          if (needto) {
            target[key] = value
          }
          return true
        }
        else {
          return Reflect.set(target, key, value, receiver)
        }
      },
      deleteProperty(target, key) {
        if (isFunction(del)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPath(chain)
          const needto = del([obj, keyPath], [target, key])
          if (needto) {
            target[key] = value
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
  const proxy = createProxy(obj)
  return proxy
}
