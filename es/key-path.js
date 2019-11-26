/**
 * @module key-path
 */

import { isObject, isSymbol } from './is.js'

/** */
export function makeKeyChain(path) {
  let chain = path.toString().split(/\.|\[|\]/).filter(item => !!item)
  return chain
}

/** */
export function makeKeyPath(chain) {
  // if there is only one item, return the first one
  // this support return a symbol
  if (chain.length === 1) {
    return chain[0]
  }

  let path = ''
  for (let i = 0, len = chain.length; i < len; i ++) {
    let key = chain[i]
    // do not support symbols
    if (isSymbol(key)) {
      const str = chain.map(item => isSymbol(item) ? item.toString() : item + '').join(', ')
      throw new TypeError(`Cannot convert a Symbol value to a string when makeKeyPath by [${str}]`)
    }
    if (/^[0-9]+$/.test(key)) {
      path += '[' + key + ']'
    }
    else {
      path += path ? '.' + key : key
    }
  }
  return path
}

/** */
export function makeKey(path) {
  let chain = makeKeyChain(path)
  let keyPath = makeKeyPath(chain)
  return keyPath
}

/** */
export function parse(obj, path) {
  let chain = makeKeyChain(path)

  if (!chain.length) {
    return obj
  }

  let target = obj
  for (let i = 0, len = chain.length; i < len; i ++) {
    let key = chain[i]
    if (target[key] === undefined) {
      return undefined
    }
    target = target[key]
  }
  return target
}

/** */
export function assign(obj, path, value) {
  const chain = makeKeyChain(path)

  if (!chain.length) {
    return obj
  }

  const key = chain.pop()

  if (!chain.length) {
    obj[key] = value
    return obj
  }

  let target = obj

  for (let i = 0, len = chain.length; i < len; i ++) {
    const current = chain[i]
    let next = chain[i + 1]
    // at the end
    if (next === undefined && i === len - 1) {
      next = key
    }

    if (/^[0-9]+$/.test(next) && !Array.isArray(target[current])) {
      target[current] = []
    }
    else if (typeof target[current] !== 'object') {
      target[current] = {}
    }
    target = target[current]
  }

  target[key] = value

  return obj
}

/** */
export function remove(obj, path) {
  let chain = makeKeyChain(path)

  if (!chain.length) {
    return obj
  }

  if (chain.length === 1) {
    delete obj[path]
    return obj
  }

  let tail = chain.pop()
  let keyPath = makeKeyPath(chain)
  let target = parse(obj, keyPath)

  if (!isObject(target) && !isArray(target)) {
    return obj
  }

  delete target[tail]
  return obj
}
