import { merge } from '../es/object.js'

describe('merge', () => {
  test('merge', () => {
    const obj1 = {
      body: {
        left: true,
      },
    }
    const obj2 = {
      body: {
        right: true,
      },
    }
    const obj = merge(obj1, obj2)
    expect(obj.body.left).toBe(true)
    expect(obj.body.right).toBe(true)
  })
})
