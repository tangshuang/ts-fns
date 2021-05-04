/**
 * 创建防抖函数
 * @param {function} fn
 * @param {number} wait
 * @param {boolean} [immediate] 是否立即执行函数
 * @returns {function}
 */
export function debounce(fn, wait, immediate) {
  let timeout = null

  return function(...args) {
    const callNow = immediate && !timeout
    const next = () => {
      timeout = null
      if (!immediate) {
        fn.apply(this, args)
      }
    }

    clearTimeout(timeout)
    timeout = setTimeout(next, wait)

    if (callNow) {
      fn.apply(this, args)
    }
  }
}

/**
 * 创建节流函数
 * @param {function} fn
 * @param {number} wait
 * @param {boolean} [immediate] 是否立即执行
 * @returns {function}
 */
export function throttle(fn, wait, immediate) {
  let timeout = null
  let lastTime = 0

  return function(...args) {
    const callNow = immediate && !timeout
    const nowTime = Date.now()
    const next = () => {
      timeout = null
      fn.apply(this, args)
    }

    if (timeout || (lastTime && nowTime < lastTime + wait)) {
      return
    }

    lastTime = nowTime

    if (callNow) {
      fn.apply(this, args)
    }
    else {
      timeout = setTimeout(next, wait)
    }
  }
}
