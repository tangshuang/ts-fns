import { inArray, isNaN, isString, isArray, isFunction } from './is.js'

/**
 * @param {*} value
 * @param {number} [count]
 * @returns {array}
 */
export function createArray(value, count = 1) {
  return [].fill.call(new Array(count), value)
}

/**
 * @param {array} a
 * @param {array} b
 * @returns {array}
 */
export function unionArray(a, b) {
  return a.concat(b.filter(v => !inArray(v, a)))
}

/**
 * @param {array} a
 * @param {array} b
 * @returns {array}
 */
export function interArray(a, b) {
  return a.filter(v => b.includes(v))
}

/**
 * @param {array} a
 * @param {array} b
 * @returns {array}
 */
export function diffArray(a, b) {
  return a.filter(v => !b.includes(v))
}

/**
 * @param {array} a
 * @param {array} b
 * @returns {array}
 */
export function compArray(a, b) {
  const diffa = diffArray(a, b)
  const diffb = diffArray(b, a)
  return diffa.concat(diffb)
}

/**
 * @param {array} arr
 * @param {string} [prop] unique by which property
 * @returns {array}
 */
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

/**
 * @param {array} items
 * @param {string} [by] which property sort by
 * @param {boolean} [decs]
 * @returns {array}
 */
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

/**
 * @param {*} arr
 * @returns {array}
 */
export function toArray(arr) {
  return Array.from(arr)
}

/**
 * @param {array} arr
 * @returns {array}
 */
export function flatArray(arr) {
  const res = []
  arr.forEach((item) => {
    const items = isArray(item) ? item : [item]
    res.push(...items)
  })
  return res
}

/**
 * slice an array into [count] sub-array
 * @param {array} arr
 * @param {number} count
 * @returns {array[]}
 */
export function groupArray(arr, count) {
  const results = []
  arr.forEach((item, i) => {
    const index = parseInt(i / count)
    results[index] = results[index] || []
    results[index].push(item)
  })
  return results
}

/**
 * split an array to sevral
 * @param {array} arr
 * @param {*|function} split
 * @returns {array[]}
 */
export function splitArray(arr, split) {
  const results = []
  let temp = []
  arr.forEach((item, i) => {
    if (split === item || (isFunction(split) && split(item, i))) {
      results.push(temp)
      temp = []
    }
    else {
      temp.push(item)
      if (i === arr.length - 1) {
        results.push(temp)
      }
    }
  })
  return results
}

/**
 * @param {array[]} arr
 * @param {*} join
 * @returns {array}
 */
export function joinArray(arr, join) {
  const results = []
  arr.forEach((items) => {
    results.push(...items, join)
  })
  return results
}
