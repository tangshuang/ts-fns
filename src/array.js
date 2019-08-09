/**
 * @module array
 */

import { inArray, isNaN, isString } from './is.js'

export function createArray(value, count = 1) {
  return [].fill.call(new Array(count), value);
}

export function unionArray(a, b) {
  return a.concat(b.filter(v => !inArray(v, a)))
}

export function interArray(a, b) {
  return a.filter(v => b.includes(v))
}

export function diffArray(a, b) {
  return a.filter(v => !b.includes(v))
}

export function compArray(a, b) {
  const diffa = diffArray(a, b)
  const diffb = diffArray(b, a)
  return diffa.concat(diffb)
}

export function uniqueArray(arr, prop) {
  const exists = []
  return arr.filter((item) => {
    if (prop) {
      let value = item[prop]
      if (exists.includes(value)) {
        return false
      }
      else {
        exists.push(value)
        return true
      }
    }
    else {
      if (exists.includes(item)) {
        return false
      }
      else {
        exists.push(item)
        return true
      }
    }
  })
}

export function sortArray(items, by, decs = false) {
  const res = [].concat(items)
  res.sort((a, b) => {
    let oa = by ? a[by] : a
    let ob = by ? b[by] : b

    oa = !isNaN(+oa) ? +oa : isString(oa) ? oa : 10
    ob = !isNaN(+ob) ? +ob : isString(ob) ? ob : 10

    if (oa < ob) {
      return decs ? 1 : -1
    }
    if (oa === ob) {
      return 0
    }
    if (oa > ob) {
      return decs ? -1 : 1
    }
  })
  return res
}

export function toArray(arr) {
  return Array.from(arr)
}
