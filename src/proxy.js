import { makeKeyPath } from './key-path.js'
import { isFunction, isObject, isArray } from './is.js'

export function createProxy(obj, options = {}) {
  const { get, set, del } = options
  const createProxy = (obj, parents = []) => {
    const handler = {
      get(target, key) {
        const value = target[key]
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
          return get([obj, keyPath, use], [target, key, value])
        }
        else {
          return use
        }
      },
      set(target, key, value) {
        if (isFunction(set)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPath(chain)
          const needto = set([obj, keyPath, value], [target, key, value])
          if (needto) {
            target[key] = value
          }
          return true
        }
        else {
          target[key] = value
          return true
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
          delete target[key]
          return true
        }
      },
    }
    return new Proxy(obj, handler)
  }
  return createProxy(obj)
}
