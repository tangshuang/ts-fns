import { merge, createReactive } from '../es/object.js'

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

  test('create reactive object', () => {
    const obj = {
      name: 'tomy',
      age: 10,
      body: {
        left: true,
        right: false,
      },
    }

    let count = 0
    const reactive = createReactive(obj, {
      dispatch: (keyPath, v) => {
        count ++
      },
      deep: true,
    })

    expect(reactive.name).toBe('tomy')
    expect(reactive.age).toBe(10)
    expect(reactive.body.left).toBe(true)
    expect(reactive.body.right).toBe(false)

    reactive.age ++
    expect(count).toBe(1)

    reactive.body.right = true
    expect(count).toBe(2)
  })

  test('create reactive array', () => {
    const obj = {
      name: 'tomy',
      age: 10,
      body: {
        left: true,
        right: false,
      },
    }
    const arr = [
      obj,
    ]

    let count = 0
    const reactive = createReactive(arr, {
      dispatch: (keyPath, v) => {
        count ++
      },
      deep: true,
    })

    expect(reactive[0].name).toBe('tomy')
    expect(reactive[0].age).toBe(10)
    expect(reactive[0].body.left).toBe(true)
    expect(reactive[0].body.right).toBe(false)

    reactive[0].age ++
    expect(count).toBe(1)

    reactive[0].body.right = true
    expect(count).toBe(2)

    reactive.push(null)
    expect(reactive.length).toBe(2)
    expect(count).toBe(3)

    reactive[1] = {
      name: 'lily',
      age: 10,
    }
    expect(count).toBe(4)

    expect(reactive[1].name).toBe('lily')
    expect(reactive[1].age).toBe(10)

    reactive[1].age ++
    expect(count).toBe(5)
  })
})
