/**
 * @module key-path
 */

import { isObject, isSymbol, isArray } from './is.js'

/**
 * convert a keyPath string to be an array
 * @param {string} path
 * @param {boolean} strict whether to keep square brackets of array index key
 * @return {array}
 */
export function makeKeyChain(path, strict = false) {
  const reg = strict ? /\.|(?=\[)/ : /\.|\[|\]\.|\]\[|\]/
  let chain = path.toString().split(reg)
  if (!strict) {
    chain = chain.filter(item => !!item)
  }
  return chain
}

/**
 * convert an array to be a keyPath string
 * @param {array} chain the array for path, without any symbol in it
 * @param {boolean} strict
 * @return {string}
 */
export function makeKeyPath(chain, strict = false) {
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
    if (!strict && /^[0-9]+$/.test(key)) {
      path += '[' + key + ']'
    }
    else if (strict && /^\[[0-9]+\]$/.test(key)) {
      path += key
    }
    else {
      path += path ? '.' + key : key
    }
  }
  return path
}

/**
 * convert a keyPath array or string to be a keyPath string
 * @param {string|array} keyPath
 * @return {string}
 */
export function makeKey(keyPath) {
  const chain = isArray(keyPath) ? keyPath : makeKeyChain(keyPath)
  const key = makeKeyPath(chain)
  return key
}

/**
 * parse a property's value by its keyPath
 * @param {object|array} obj
 * @param {string|array} keyPath
 */
export function parse(obj, keyPath) {
  let chain = isArray(keyPath) ? keyPath : makeKeyChain(keyPath)

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

/**
 * assign a property's value by its keyPath
 * @param {object|array} obj
 * @param {string|array} keyPath
 */
export function assign(obj, keyPath, value) {
  const chain = isArray(keyPath) ? keyPath : makeKeyChain(keyPath)

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

    if (/^[0-9]+$/.test(next) && !isArray(target[current])) {
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

/**
 * remove a property by its keyPath
 * @param {object|array} obj
 * @param {string|array} keyPath
 */
export function remove(obj, keyPath) {
  const chain = isArray(keyPath) ? keyPath : makeKeyChain(keyPath)

  if (!chain.length) {
    return obj
  }

  if (chain.length === 1) {
    delete obj[chain[0]]
    return obj
  }

  const tail = chain.pop()
  const target = parse(obj, chain)

  if (!isObject(target) && !isArray(target)) {
    return obj
  }

  delete target[tail]
  return obj
}
