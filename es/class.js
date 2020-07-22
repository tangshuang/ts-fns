/**
 * @module class
 */

import { each, define } from './object.js'

/** */
export function getConstructorOf(ins) {
  return Object.getPrototypeOf(ins).constructor
}

/**
 * Create a new Child Class which is inherited from Parent Class
 * @param {Class} Parent
 * @param {object} proptotypes
 * @param {object} statics
 */
export function inherit(Parent, proptotypes = {}, statics = {}) {
  class Child extends Parent {}
  const { name } = Parent

  Object.assign(Child.prototype, proptotypes)
  Child.prototype.constructor = Child

  define(Child, 'name', {
    writable: true,
    value: name,
  })

  each(statics, (value, key) => {
    const descriptor = Object.getOwnPropertyDescriptor(statics, key)
    define(Child, key, descriptor)
  })

  return Child
}
