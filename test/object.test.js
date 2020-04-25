import { merge, createReactive, createProxy } from '../es/object.js'

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

describe('reactive', () => {
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

  test('$set', () => {
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
    })

    reactive.$set('newField', 1) // this will trigger dispatch
    expect(reactive.newField).toBe(1)

    reactive.newField = 2
    expect(reactive.newField).toBe(2)

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

  test('origin equal', () => {
    const o = {}
    const r = createReactive(o, {})

    r.$set('name', 'tony')
    expect(r.name).toBe('tony')
    expect(o.name).toBe('tony')
  })

  test('reactive refererence', () => {
    const some = {
      body: {
        hand: true,
        foot: true,
      },
    }
    const a = createReactive(some, {
      get(keyPath, value) {
        if (keyPath.join('.') === 'body.hand') {
          return value.toString()
        }
        else {
          return value
        }
      },
    })

    expect(a.body).not.toBe(some.body)
    expect(a.body.hand).toBe('true')
    expect(a.body.foot).toBe(true)

    a.body.hand = false
    expect(a.body.hand).toBe('false')
    expect(some.body.hand).toBe(false)
  })
})

describe('proxy', () => {
  test('createProxy', () => {
    const data = {
      name: 'tomy',
      age: 10,
      weight: 20,
      body: {
        hand: 20,
        foot: 50,
      },
    }
    const state = createProxy(data, {
      dispatch(keyPath, value) {
        if (keyPath.join('.') === 'age') {
          state.weight = value * 2
        }
        else if (keyPath.join('.') === 'body.hand') {
          state.body.foot = value * 2.5
        }
      },
    })

    state.age = 4
    expect(state.weight).toBe(8)

    state.body.hand = 22
    expect(state.body.foot).toBe(55)
  })

  test('proxy object.function', () => {
    const o = {
      name: 'tomy',
      say() {
        return this.name
      },
    }
    const p = createProxy(o, {})
    p.name = 'ximi'
    expect(p.say()).toBe('ximi')
  })

  test('origin equal', () => {
    const o = {}
    const p = createProxy(o, {})

    p.name = 'tony'
    expect(o.name).toBe('tony')
  })

  test('proxy refererence', () => {
    const some = {
      body: {
        hand: true,
        foot: true,
      },
    }
    const a = createProxy(some, {
      get(keyPath, value) {
        if (keyPath.join('.') === 'body.hand') {
          return value.toString()
        }
        else {
          return value
        }
      },
    })

    expect(a.body).not.toBe(some.body)
    expect(a.body.hand).toBe('true')
    expect(a.body.foot).toBe(true)

    a.body.hand = false
    expect(a.body.hand).toBe('false')
    expect(some.body.hand).toBe(false)
  })
})
