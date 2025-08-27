/**
 * get value by using a function
 * @template {any} T
 * @template {any[]} U
 * @param {(...args: U) => T} decide
 * @param {U} args
 * @returns {T}
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
