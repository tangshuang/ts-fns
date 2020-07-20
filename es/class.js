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
  Child.prototype = Object.create(Parent.prototype)
  Child.prototype.constructor = Child

  each(Parent, (value, key) => {
    const descriptor = Object.getOwnPropertyDescriptor(statics, key)
    define(Child, key, descriptor)
  })

  return Child
}

/**
 * Create a new Child Class which is extended from Parent Class
 * @param {Class} Parent
 * @param {object} proptotypes
 * @param {object} statics
 */
export function extend(Parent, proptotypes = {}, statics = {}) {
  class NewClass extends Parent {}
  const { name } = Parent

  Object.assign(NewClass.prototype, proptotypes)
  NewClass.prototype.constructor = NewClass

  define(NewClass, 'name', {
    writable: true,
    value: name,
  })

  each(statics, (value, key) => {
    const descriptor = Object.getOwnPropertyDescriptor(statics, key)
    define(NewClass, key, descriptor)
  })

  return NewClass
}
