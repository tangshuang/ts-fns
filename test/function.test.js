import { compute_, get_, async_, invoke_, pipe_ } from '../es/index.js'

describe('function', () => {
  test('compute_: basic', () => {
    let count = 0

    const compute = compute_((x, y) => {
      count ++
      return x + y
    })

    const a = compute(1, 2)
    const b = compute(1, 2)
    const c = compute(1, 3)
    const d = compute(1, 3)

    expect(a).toBe(b)
    expect(c).toBe(d)
    expect(count).toBe(2)

    const e = compute(1, 3)
    compute.clear(true) // clear all cache
    const f = compute(1, 3) // recompute

    expect(e).toBe(c)
    expect(e).toBe(f)
    expect(count).toBe(3)
  })

  test('compute_: expired', (done) => {
    let count = 0

    const compute = compute_((x, y) => {
      count ++
      return x + y
    }, 20)

    const a = compute(1, 2)
    const b = compute(1, 2)
    const c = compute(1, 2)

    expect(count).toBe(1)

    // cache not expired
    setTimeout(() => {
      const d = compute(1, 2)
      expect(count).toBe(1)
    }, 10)

    // cache expired
    setTimeout(() => {
      const e = compute(1, 2)
      expect(count).toBe(2)
      done()
    }, 30)
  })

  test('get_: basic', () => {
    let count = 0

    const get = get_(() => {
      count ++
      return Math.random()
    })

    const a = get()
    const b = get()

    expect(a).toBe(b)
    expect(count).toBe(1)
  })

  test('get_: Promise', (done) => {
    let count = 0

    const get = get_(() => {
      count ++
      return Math.random()
    }, 1)

    const a = get()
    const b = get()

    expect(a).toBe(b)
    expect(count).toBe(1)

    Promise.resolve().then(() => {
      const c = get()

      expect(c).not.toBe(a)
      expect(count).toBe(2)

      setTimeout(() => {
        const d = get()

        expect(d).not.toBe(a)
        expect(count).toBe(3)

        done()
      })
    })
  })

  test('get_: timeout', (done) => {
    let count = 0

    const get = get_(() => {
      count ++
      return Math.random()
    }, 2)

    const a = get()
    const b = get()

    expect(a).toBe(b)
    expect(count).toBe(1)

    Promise.resolve().then(() => {
      const c = get()

      expect(c).toBe(a)
      expect(count).toBe(1)

      setTimeout(() => {
        const d = get()

        expect(d).not.toBe(a)
        expect(count).toBe(2)

        done()
      })
    })
  })

  test('asnyc_: basic', (done) => {
    let count = 0

    const afn = async_((x, y) => {
      count ++
      return x + y
    })

    const p1 = afn(1, 2)
    const p2 = afn(1, 2)

    expect(p1).toBe(p2)
    expect(count).toBe(0) // not invoked

    Promise.all([p1, p2]).then(([z1, z2]) => {
      expect(z1).toBe(z2)
      expect(count).toBe(1) // invoked async
      done()
    })
  })

  test('invoke_: basic', () => {
    let count = 0

    const fn = invoke_(() => {
      count ++
      return Math.random()
    }, 2)

    const a = fn()

    expect(count).toBe(1)

    const b = fn()

    expect(count).toBe(1)
    expect(a).toBe(b)

    const c = fn()

    expect(count).toBe(2)
    expect(c).not.toBe(a)
  })

  test('pipe_', () => {
    const fn = pipe_(
      x => x + 2,
      x => x - 1,
      x => x * 3,
    )

    const y = fn(2)

    expect(y).toBe(9)
  })
})
