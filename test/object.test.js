import { merge, createReactive, createProxy, extend, each } from '../es/object.js'

describe('object', () => {
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

  test('extend', () => {
    const o = {}
    const e = {
      body: {
        hand: 2,
        foot: 2,
      },
    }

    extend(o, e)

    expect(o.body.hand).toBe(2)
    expect(o.body.foot).toBe(2)
  })

  test('each', () => {
    let count = 0

    each({
      name: 'name',
      do() {},
      get len() { return this.name.length },
    }, () => count ++)

    expect(count).toBe(3)

    let b = 0
    let c = 0

    class Dog {
      static name = 'dog'
      static bark() {}
      static get age() {
        return 10
      }
    }

    each(Dog, () => b ++, true)
    expect(b).toBe(3)

    each(Dog, () => c ++)
    expect(c).toBe(1) // only `name` was found
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
      dispatch: () => {
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
      dispatch: () => {
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
      dispatch: () => {
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
      dispatch({ keyPath, value }) {
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

  test('push into top array', () => {
    let match = ''

    const arr = createProxy([], {
      set(keyPath, value) {
        match = keyPath.join('.')
        return value
      },
    })

    arr.push({
      name: 'xxx',
      age: 'xxx',
    })
    // push will trigger set in proxy
    expect(match).toBe('0.age')

    arr[0].name = 'bbb'
    expect(match).toBe('0.name')

    const obj = createProxy({
      items: [],
    }, {
      set(keyPath, value) {
        match = keyPath.join('.')
        return value
      },
    })
    // init will trigger set
    expect(match).toBe('items')

    obj.items.push({
      name: 'a',
      age: 0,
    })
    // push will trigger set in proxy
    expect(match).toBe('items.0.age')

    obj.items[0].name = 'b'
    expect(match).toBe('items.0.name')
  })

  test('splice', () => {
    const arr = createProxy([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ])

    const deleted = arr.splice(1, 0, { id: 'new' })
    expect(arr[1].id).toBe('new')
    expect(deleted.length).toBe(0)

    const removed = arr.splice(2, 2, { id: 'a' }, { id: 'b' })
    expect(removed.length).toBe(2)
  })

  test('Symbol(ORIGIN)', () => {
    const obj = {
      sub: { a: 1 },
    }
    const proxy = createProxy(obj)

    const sub = proxy.sub
    expect(sub).not.toBe(obj.sub)
    expect(sub[Symbol('ORIGIN')]).toBe(obj.sub)
  })

  test('proxy frozen object & receive option', () => {
    const obj = {
      name: 'tomy',
    }
    const fo = Object.freeze(obj)

    let count = 0
    let received = ''
    const proxy = createProxy(fo, {
      receive(_, value) {
        received = value
      },
      dispatch() {
        count ++
      },
    })
    expect(proxy.name).toBe('tomy')

    proxy.name = 'tom'
    expect(proxy.name).toBe('tomy')
    expect(count).toBe(0)
    expect(received).toBe('tom')
  })
})
