/**
 * @module class
 */

import { each, define } from './object.js'

/** */
export function getConstructorOf(ins) {
  return Object.getPrototypeOf(ins).constructor
}

/**
 * Make Child Class inherited from Parent Class, contains statics properties
 * @param {Class} Child it's best to be an empty Class
 * @param {Class} Parent
 */
export function inherit(Child, Parent) {
  const prototypes = Object.getOwnPropertyNames(Parent.prototype)
  define(Child.proptotype, 'constructor', { value: Child })
  prototypes.forEach((key) => {
    if (key === 'constructor') {
      return
    }
    const descriptor = Object.getOwnPropertyDescriptor(Parent.proptotype, key)
    define(Child.prototype, key, descriptor)
  })

  each(Parent, (value, key) => {
    const descriptor = Object.getOwnPropertyDescriptor(Parent, key)
    define(Child, key, descriptor)
  })

  return Child
}

/**
 * Make Parent Class to be prototype of Child Class
 * @param {Class} Child
 * @param {Class} Parent
 */
export function proto(Child, Parent) {
  Object.setPrototypeOf(Child, Parent)
  Object.setPrototypeOf(Child.prototype, Parent.prototype)
  return Child
}

/**
 * Create a new Child Class which is extended from Parent Class
 * @param {Class} Parent
 * @param {object} proptotypes
 * @param {object} statics
 */
export function extend(Parent, proptotypes = {}, statics = {}) {
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
