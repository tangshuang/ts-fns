/**
 * @module array
 */

import { inArray } from './is.js'

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

export function toArray (list, start = 0) {
  let count = list.length - start
  let result = new Array(count)
  while (count--) {
    result[count] = list[count + start]
  }
  return result
}
