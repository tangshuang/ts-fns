import { inherit } from '../es/class.js'

describe('class', () => {
  test('inherit', () => {
    class A {
      constructor(name) {
        this.name = name
      }
      getName() {
        return this.name
      }
    }
    const B = inherit(A)

    const b = new B('tomi')
    expect(b.getName()).toBe('tomi')

    const C = inherit(A, {}, class {
      static default = 'c'
    })
    expect(C.default).toBe('c')
  })
})
