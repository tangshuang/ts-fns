import { isFunction, isConstructor, isNone, isShallowEqual } from '../es/index.js'

describe('is', () => {
  test('isFunction', () => {
    function test() {}
    expect(isFunction(test)).toBe(true)

    const sy = test.bind(null)
    expect(isFunction(sy)).toBe(true)

    const mn = () => {}
    expect(isFunction(mn)).toBe(true)

    const xs = () => {
      this.xx = null
    }
    expect(isFunction(xs)).toBe(true)

    function Some() {
      this.name = 'some'
    }
    expect(isFunction(Some)).toBe(true)
    expect(isFunction(Some, true)).toBe(true) // notice this line

    expect(isFunction(String)).toBe(true)
    expect(isFunction(String, true)).toBe(false)

    class Tx {}
    expect(isFunction(Tx)).toBe(true)
    expect(isFunction(Tx, true)).toBe(false)

    function Next() {}
    Next.prototype.get = function() {}
    expect(isFunction(Next)).toBe(true)
    expect(isFunction(Next, true)).toBe(false)
  })
  test('isConstructor', () => {
    function test() {}
    expect(isConstructor(test)).toBe(true)
    expect(isConstructor(test, 1)).toBe(false)

    function Some() {
      this.name = 'some'
    }
    expect(isConstructor(Some)).toBe(true)
    expect(isConstructor(Some, 1)).toBe(true)
    expect(isConstructor(Some, 2)).toBe(false)

    function Next() {}
    Next.prototype.get = function() {}
    expect(isConstructor(Next)).toBe(true)
    expect(isConstructor(Next, 1)).toBe(true)
    expect(isConstructor(Next, 2)).toBe(true)
    expect(isConstructor(Next, 3)).toBe(false)

    const Tx = class {}
    expect(isConstructor(Tx)).toBe(true)
    expect(isConstructor(Tx, 1)).toBe(true)
    expect(isConstructor(Tx, 2)).toBe(true)
    expect(isConstructor(Tx, 3)).toBe(true)
    expect(isConstructor(Tx, 4)).toBe(true)

    expect(isConstructor(String)).toBe(true)
    expect(isConstructor(String, 1)).toBe(true)
    expect(isConstructor(String, 2)).toBe(true)
    expect(isConstructor(String, 3)).toBe(true)
    expect(isConstructor(String, 4)).toBe(true)

    const sy = test.bind(null)
    expect(isConstructor(sy)).toBe(false)

    // notice the following line:
    // babel will transform the function to be `var mn = function() {}`,
    // so, if you use babel in your project, the result may be true
    const mn = () => {}
    expect(isConstructor(mn)).toBe(false)

    // notice the following line:
    // babel will transform the function to be `var xs = function() { this.xx = null }`,
    // so, if you use babel in your project, the result may be true
    const xs = () => {
      this.xx = null
    }
    expect(isConstructor(xs)).toBe(false)
  })
  test('isNone', () => {
    expect(isNone(null)).toBe(true)
    expect(isNone(undefined)).toBe(true)
    expect(isNone(+'~')).toBe(true) // NaN
    expect(isNone(0)).toBe(false)
    expect(isNone('')).toBe(false)
  })
  test('isShallowEqual', () => {
    expect(isShallowEqual(1, 1)).toBe(true)
    expect(isShallowEqual('1', '1')).toBe(true)
    expect(isShallowEqual(null, null)).toBe(true)
    expect(isShallowEqual([], [])).toBe(true)
    expect(isShallowEqual({}, {})).toBe(true)
    expect(isShallowEqual(true, true)).toBe(true)
    expect(isShallowEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(isShallowEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true)
    expect(isShallowEqual([{ a: 1 }], [{ a: 1 }], 1)).toBe(true)
    expect(isShallowEqual({ a: 1 }, { a: 1 })).toBe(true)
    expect(isShallowEqual({ a: { b: 1 } }, { a: { b: 1 } }, 1)).toBe(true)


    expect(isShallowEqual('1', 1)).toBe(false)
    expect(isShallowEqual({}, null)).toBe(false)
    expect(isShallowEqual(0, false)).toBe(false)
    expect(isShallowEqual([], {})).toBe(false)
    expect(isShallowEqual('1', 1)).toBe(false)
    expect(isShallowEqual([1, 2, 3], [3, 2, 1])).toBe(false)
    expect(isShallowEqual(['a', 'b', 'c'], ['c', 'b', 'a'])).toBe(false)
    expect(isShallowEqual([{ a: 1 }], [{ a: 1 }])).toBe(false)
    expect(isShallowEqual([{ a: 1 }], [{ a: 2 }], 1)).toBe(false)
    expect(isShallowEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false)
    expect(isShallowEqual({ a: { b: 1 } }, { a: { b: 2 } }, 1)).toBe(false)
  })
})
