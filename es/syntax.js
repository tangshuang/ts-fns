/**
 * get value by using a function
 * @param {function} decide
 * @param {...any} args
 */
export function decideby(decide, ...args) {
  return decide(...args)
}

/**
 * get value by different conditions
 * @param {Array<Function,Function>} entries [[condition, getter]]
 */
export function caseby(entries, ...args) {
  for (let [cond, get] of entries) {
    if (cond(...args)) {
      return get(...args)
    }
  }
}
