import { isObject, isSymbol, isArray, isUndefined, isNumber, isString } from './is.js'

/**
 * convert a keyPath string to be an array
 * @param {string} path
 * @param {boolean} [isStrict] whether to keep square bracket keys
 * @returns {array}
 */
export function makeKeyChain(path, isStrict) {
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
      chain[i] = key
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
 * @param {string|array} keyPath
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
 * @param {string|array} key
 */
export function parse(obj, key) {
  let chain = isArray(key) ? [...key] : makeKeyChain(key)

  if (!chain.length) {
    return obj
  }

  let target = obj
  for (let i = 0, len = chain.length; i < len; i ++) {
    const one = chain[i]
    if (isUndefined(target[one])) {
      return
    }
    target = target[one]
  }
  return target
}

/**
 * assign a property's value by its keyPath
 * @param {object|array} obj
 * @param {string|array} key
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

    if (isString(next) && /^[0-9]+$/.test(next) && !isArray(target[current])) {
      target[current] = []
    }
    else if (typeof target[current] !== 'object') {
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
 * @param {string|array} key
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
