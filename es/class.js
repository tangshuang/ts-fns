import { each, define } from './object.js'
import { inObject } from './is.js'

/**
 * @param {any} ins
 * @returns {boolean}
 */
export function getConstructorOf(ins) {
  return Object.getPrototypeOf(ins).constructor
}

/**
 * Create a new Child any which is inherited from Parent any
 * @param {any} Parent
 * @param {object} proptotypes
 * @param {object} statics
 * @returns {any}
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

/**
 * mix Extend into Source, (notice: will override Source)
 * @param {any} Source
 * @param {any} Extend
 * @param {any}
 */
export function mixin(Source, Extend) {
  each(Extend, (descriptor, key) => {
    define(Source, key, descriptor)
  }, true)

  each(Extend.prototype, (descriptor, key) => {
    if (key === 'constructor') {
      return
    }
    define(Source.prototype, key, descriptor)
  }, true)

  return Source
}
