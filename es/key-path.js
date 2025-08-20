/**
 * @typedef {string|number|Array<string|symbol|number>} KeyPath
 */

import { isObject, isSymbol, isArray, isUndefined, isNumber, isString, isNumeric } from './is.js'

/**
 * convert a keyPath string to be an array
 * @param {string} path
 * @param {boolean} [isStrict] whether to keep square bracket keys. i.e. a[1] => ['a', '[1]']
 * @returns {array}
 */
export function makeKeyChain(path, isStrict) {
  if (typeof path === 'number') {
    return [path];
  }

  const mapping = []
  const text = path.replace(/\[.*?\]/g, (matched, position) => {
    const index = mapping.length
    mapping.push(matched)
    return `${position ? '.' : ''}{${index}}`
  })

  const chain = text.split('.')
  chain.forEach((item, i) => {
    if (/^\{\d+\}$/.test(item)) {
      const index = item.substring(1, item.length - 1)
      const str = mapping[index]
      const key = isStrict ? str : str.substring(1, str.length - 1)
      chain[i] = isNumeric(key) ? +key : key
    }
  })

  return chain
}

/**
 * convert an array to be a keyPath string
 * @param {array} chain the array for path, without any symbol in it
 * @param {boolean} [isStrict] wether to use [] to wrap number key
 * @returns {string}
 */
export function makeKeyPath(chain, isStrict) {
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
      const symbol = key.toString()
      path += '[' + symbol + ']'
    }
    // 1
    else if (isStrict && isNumber(key)) {
      path += '[' + key + ']'
    }
    // '1'
    else if (isStrict && isString(key) && /^[0-9]+$/.test(key)) {
      path += '[' + key + ']'
    }
    // '[1]' or '[a]' or '[a.b]'
    else if (isStrict && isString(key) && /^\[.*\]$/.test(key)) {
      path += key
    }
    // 'a.b'
    else if (isString(key) && key.indexOf('.') > -1) {
      path += '[' + key + ']'
    }
    else {
      path += path ? '.' + key : key
    }
  }
  return path
}

/**
 * convert a keyPath array or string to be a keyPath string
 * @param {KeyPath} keyPath
 * @returns {string}
 */
export function makeKey(keyPath) {
  const chain = isArray(keyPath) ? keyPath : makeKeyChain(keyPath)
  const key = makeKeyPath(chain)
  return key
}

/**
 * parse a property's value by its keyPath
 * @param {object|array} obj
 * @param {KeyPath} key
 */
export function parse(obj, key) {
  const chain = isArray(key) ? [...key] : makeKeyChain(key)

  if (!chain.length) {
    return obj
  }

  let target = obj
  for (let i = 0, len = chain.length; i < len; i ++) {
    // fallback, without error
    if (!target || typeof target !== 'object') {
      return
    }

    const key = chain[i]

    // want an array
    if (key === '*') {
      if (!isArray(target)) {
        return
      }
      if (i + 1 >= len) {
        return target
      }
      const restChain = chain.slice(i + 1)
      const items = target.map(item => parse(item, restChain))
      return items
    }

    // want a value
    const node = target[key]
    target = node
  }
  return target
}

/**
 * parse a property into a new object which contains only the parsed property
 * @example
 * var a = { a: 1, b: 2, c: 3 };
 * var b = parseAs(a, 'b'); // -> { b: 2 }
 * @param {object|array} obj
 * @param {KeyPath} key
 */
export function parseAs(obj, key) {
  const chain = isArray(key) ? [...key] : makeKeyChain(key);

  if (!chain.length) {
    return obj;
  }

  const results = isArray(obj) ? [] : {};
  const keyPath = [];

  let target = obj
  for (let i = 0, len = chain.length; i < len; i ++) {
    // fallback, without error
    if (!target || typeof target !== 'object') {
      return results;
    }

    const key = chain[i];

    // want an array
    if (key === '*') {
      if (!isArray(target)) {
        return results;
      }
      if (i + 1 >= len) {
        return results;
      }

      const restChain = chain.slice(i + 1);
      target.forEach((item, i) => {
        const ret = parseAs(item, restChain);
        assign(results, [keyPath, i], ret);
      });
      return results;
    }

    // want a value
    keyPath.push(key);
    const node = target[key]
    target = node
  }
  assign(results, keyPath, target)
  return results
}

/**
 * assign a property's value by its keyPath
 * @param {object|array} obj
 * @param {KeyPath} key
 * @param {any} value
 * @returns {object|array}
 */
export function assign(obj, key, value) {
  const chain = isArray(key) ? [...key] : makeKeyChain(key)

  if (!chain.length) {
    return obj
  }

  const tail = chain.pop()

  if (!chain.length) {
    obj[tail] = value
    return obj
  }

  let target = obj

  for (let i = 0, len = chain.length; i < len; i ++) {
    const current = chain[i]
    let next = chain[i + 1]
    // at the end
    if (isUndefined(next) && i === len - 1) {
      next = tail
    }

    if (isNumber(next) && !isArray(target[current])) {
      target[current] = []
    }
    else if (isString(next) && /^[0-9]+$/.test(next) && !isArray(target[current])) {
      target[current] = []
    }
    else if (target[current] === null || typeof target[current] !== 'object') {
      target[current] = {}
    }

    target = target[current]
  }

  target[tail] = value

  return obj
}

/**
 * remove a property by its keyPath
 * @param {object|array} obj
 * @param {KeyPath} key
 * @returns {object|array}
 */
export function remove(obj, key) {
  const chain = isArray(key) ? [...key] : makeKeyChain(key)

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

/**
 * check whether a keyPath is in the given object,
 * both string and symbol properties will be checked,
 * as default, it will check:
 *  - both enumerable and non-enumerable properties;
 *  - both own and prototype-chain properties;
 * if enumerable=true, it will check:
 *  - only enumerable properties;
 *  - only own properties;
 * @param {KeyPath} key
 * @param {*} obj
 * @param {*} [enumerable]
 * @returns {boolean}
 */
export function keyin(key, obj, enumerable) {
  if (!obj || typeof obj !== 'object') {
    return false
  }

  const chain = isArray(key) ? [...key] : makeKeyChain(key)

  if (!chain.length) {
    return false
  }

  const tail = chain.pop()
  const has = (obj, key) => Object.prototype.propertyIsEnumerable.call(obj, key)

  if (!chain.length) {
    return enumerable ? has(obj, tail) : tail in obj
  }

  let target = obj
  for (let i = 0, len = chain.length; i < len; i ++) {
    const key = chain[i]
    const node = enumerable ? (has(target, key) ? target[key] : null) : target[key]

    if (!node || typeof node !== 'object') {
      return false
    }

    target = node
  }

  return enumerable ? has(target, tail) : tail in target
}
