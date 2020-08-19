/**
 * @module class
 */

import { each, define } from './object.js'
import { inObject } from './is.js'

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
export function inherit(Parent, proptotypes, statics) {
  class Child extends Parent {}

  const name = Object.getOwnPropertyDescriptor(Parent, 'name')
  define(Child, 'name', {
    ...name,
    configurable: true,
  })

  if (proptotypes) {
    Object.assign(Child.prototype, proptotypes)
    Child.prototype.constructor = Child
  }

  each(Parent, (descriptor, key) => {
    if (statics && inObject(key, statics, true)) {
      return
    }
    define(Child, key, descriptor)
  }, true)

  if (statics) {
    each(statics, (descriptor, key) => {
      define(Child, key, descriptor)
    }, true)
  }

  return Child
}
