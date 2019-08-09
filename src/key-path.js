import { isObject } from './is.js'

export function makeKeyChainByPath(path) {
  let chain = path.toString().split(/\.|\[|\]/).filter(item => !!item)
  return chain
}

export function makeKeyPathByChain(chain) {
  let path = ''
  for (let i = 0, len = chain.length; i < len; i ++) {
    let key = chain[i]
    if (/^[0-9]+$/.test(key)) {
      path += '[' + key + ']'
    }
    else {
      path += path ? '.' + key : key
    }
  }
  return path
}

export function makeKeyPath(path) {
  let chain = makeKeyChainByPath(path)
  let keyPath = makeKeyPathByChain(chain)
  return keyPath
}

export function parse(obj, path) {
  let chain = makeKeyChainByPath(path)

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

export function assign(obj, path, value) {
  let chain = makeKeyChainByPath(path)

  if (!chain.length) {
    return obj
  }

  let key = chain.pop()

  if (!chain.length) {
    obj[key] = value
    return obj
  }

  let target = obj

  for (let i = 0, len = chain.length; i < len; i ++) {
    let key = chain[i]
    let next = chain[i + 1] || key
    if (/^[0-9]+$/.test(next) && !Array.isArray(target[key])) {
      target[key] = []
    }
    else if (typeof target[key] !== 'object') {
      target[key] = {}
    }
    target = target[key]
  }

  target[key] = value

  return obj
}

export function remove(obj, path) {
  let chain = makeKeyChainByPath(path)

  if (!chain.length) {
    return obj
  }

  if (chain.length === 1) {
    delete obj[path]
    return obj
  }

  let tail = chain.pop()
  let keyPath = makeKeyPathByChain(chain)
  let target = parse(obj, keyPath)

  if (!isObject(target) && !isArray(target)) {
    return obj
  }

  delete target[tail]
  return obj
}
