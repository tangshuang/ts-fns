/**
 * @module class
 */

/** */
export function getConstructorOf(ins) {
  return Object.getPrototypeOf(ins).constructor
}

/** */
export function inherit(child, parent) {
  return Object.setPrototypeOf(child, parent)
}

/** */
export function extend(Class, proptotypes, statics) {
  const { name } = Class
  const o = {
    [name]: class extends Class {},
  }
  const C = o[name]

  Object.assign(C.prototype, proptotypes || {})
  Object.assign(C, { ...Class })
  Object.assign(C, statics || {})

  return C
}
