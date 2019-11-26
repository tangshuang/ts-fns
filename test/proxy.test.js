import { createProxy, getProxied } from '../es/proxy.js'

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
      // get([data, keyPath], [target, key, value]) {},
      set([data, keyPath], [target, key, value]) {
        if (keyPath === 'age') {
          target.weight = value * 2
        }
        else if (keyPath === 'body.hand') {
          target.foot = value * 2.5
        }
        return true
      },
      // del([data, keyPath], [target, key]) {},
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
  test(`Symbol.for('[[Target]]')`, () => {
    const o = {}
    const p = createProxy(o, {})
    expect(p[Symbol.for('[[Target]]')]).toBe(o)
  })
  test('getProxied', () => {
    const o = {
      body: {
        head: 'ok',
      },
    }
    const p = createProxy(o, {})
    const t = getProxied(p)
    expect(t).toBe(o) // NOTICE not
    expect(t.body.head).toBe('ok')
  })
})
