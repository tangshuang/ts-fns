import { makeKeyPath } from './key-path.js'
import { isFunction, isObject, isArray } from './is.js'

export function createProxy(obj, options = {}) {
  const { get, set, del } = options
  const createProxy = (obj, parents = []) => {
    const subproxies = {}
    const handler = {
      get(target, key) {
        const value = target[key]
        let use

        if (isObject(value) || isArray(value)) {
          if (subproxies[key]) {
            use = subproxies[key]
          }
          else {
            const proxy = createProxy(value, [ ...parents, key ])
            subproxies[key] = proxy
            use = proxy
          }
        }
        else {
          use = value
        }

        if (isFunction(get)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPath(chain)
          return get([obj, keyPath, use], [target, key, use])
        }
        else {
          return use
        }
      },
      set(target, key, value) {
        if (isFunction(set)) {
          const chain = [ ...parents, key ]
          const keyPath = makeKeyPath(chain)
          set([obj, keyPath, value], [target, key, value])
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
          del([obj, keyPath], [target, key])
          delete subproxies[key]
          return true
        }
        else {
          delete target[key]
          delete subproxies[key]
          return true
        }
      },
    }
    return new Proxy(obj, handler)
  }
  return createProxy(obj)
}
