/**
 * @module mapping
 */

export function pickArrayByMapping(arr, key, mapping) {
  let res = arr.filter(item => mapping[item[key]])

  let keys = Object.keys(mapping)
  let order = {}
  keys.forEach((key, i) => {
    order[key] = i
  })

  res.sort((a, b) => {
    let oa = order[a[key]]
    let ob = order[b[key]]
    return oa > ob ? 1 : oa < ob ? -1 : 0
  })

  return res
}

export function pickObjectByKeys(obj, keys) {
  let res = {}
  keys.forEach((key) => {
    res[key] = obj[key]
  })
  return res
}

export function pickObjectByMapping(obj, mapping) {
  let res = {}

  let keys = Object.keys(mapping)
  keys.forEach((key) => {
    let willuse = mapping[key]
    if (willuse) {
      res[key] = obj[key]
    }
  })

  return res
}

export function createObjectFromList(list, key) {
  const results = {}
  const indexes = Object.keys(list)
  indexes.forEach((i) => {
    const item = list[i]
    const prop = item[key]
    if (prop) {
      results[prop] = item
    }
  })
  return results
}

export function findParentInTree(key, mapping) {
  const keys = Object.keys(mapping)
  for (let i = 0, len = keys.length; i < len; i ++) {
    const prop = keys[i]
    const child = mapping[prop]
    if (child[key]) {
      return prop
    }
  }
}
