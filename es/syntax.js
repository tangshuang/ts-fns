/**
 * get value by using a function
 * @param {function} decide
 * @param {*} args
 * @returns {*}
 */
export function decideby(decide, ...args) {
  return decide(...args)
}

/**
 * get value by different conditions
 * @param {any[]} entries [[condition, getter]]
 * @param {*} args
 * @returns {*}
 */
export function caseby(entries, ...args) {
  for (let [cond, get] of entries) {
    if (cond(...args)) {
      return get(...args)
    }
  }
}
