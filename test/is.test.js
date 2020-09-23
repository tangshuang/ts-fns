import { isFunction, isConstructor } from '../es/index.js'

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
    expect(isFunction(Some)).toBe(true) // notice this line

    expect(isFunction(String)).toBe(false)

    class Tx {}
    expect(isFunction(Tx)).toBe(false)

    function Next() {}
    Next.prototype.get = function() {}
    expect(isFunction(Next)).toBe(false)
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
})