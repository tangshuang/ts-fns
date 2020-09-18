import { isFunction, isConstructor } from '../es/index.js'

describe('is', () => {
  test('isFunction & isConstructor', () => {
    function test() {}
    expect(isFunction(test)).toBe(true)
    expect(isConstructor(test)).toBe(false)

    const sy = test.bind(null)
    expect(isFunction(sy)).toBe(true)
    expect(isConstructor(sy)).toBe(false)

    const mn = () => {}
    expect(isFunction(mn)).toBe(true)
    expect(isConstructor(mn)).toBe(false)

    expect(isFunction(String)).toBe(false)
    expect(isConstructor(String)).toBe(true)

    const xs = () => {
      this.xx = null
    }
    expect(isFunction(xs)).toBe(true)
    expect(isConstructor(xs)).toBe(false)

    function Some() {
      this.name = 'some'
    }
    expect(isFunction(Some)).toBe(true) // notice this line
    expect(isConstructor(Some)).toBe(true)

    function Next() {}
    Next.prototype.get = function() {}
    expect(isFunction(Next)).toBe(false)
    expect(isConstructor(Next)).toBe(true)

    const Tx = class {}
    expect(isFunction(Tx)).toBe(false)
    expect(isConstructor(Tx)).toBe(true)
  })
})