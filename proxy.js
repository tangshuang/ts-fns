import { makeKeyPathByChain } from './key-path.js'
import { isFunction, isObject, isArray } from './is.js'

export function createProxy(obj, options = {}) {
  const { get, set, del } = options
  const createProxy = (obj, parents = []) => {
    const subproxies = {}
    const handler = {
      get(target, key) {
        const value = target[key]

        if (isFunction(get)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPathByChain(chain)
          get(keyPath, target, key, value, obj)
        }

        if (isObject(value) || isArray(value)) {
          if (subproxies[key]) {
            return subproxies[key]
          }
          const proxy = createProxy(value, [ ...parents, key ])
          subproxies[key] = proxy
          return proxy
        }
        else {
          return value
        }
      },
      set(target, key, value) {
        if (isFunction(set)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPathByChain(chain)
          set(keyPath, target, key, value, obj)
        }

        target[key] = value
        return true
      },
      deleteProperty(target, key) {
        if (isFunction(del)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPathByChain(chain)
          del(keyPath, target, key, obj)
        }

        delete target[key]
        delete subproxies[key]
        return true
      },
    }
    return new Proxy(obj, handler)
  }
  return createProxy(obj)
}
