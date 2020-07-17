import { parse, assign, makeKeyPath, makeKeyChain } from '../es/key-path.js'

describe('key-path', () => {
  test('deep array item object', () => {
    const data = {
      data: {
        books: [
          {
            name: 'ok',
            price: 10,
          }
        ]
      }
    }
    assign(data, 'data.books[0].price', 0)
    expect(parse(data, 'data.books[0].price')).toBe(0)

    assign(data, 'data.books.0.price', 1)
    expect(parse(data, 'data.books.0.price')).toBe(1)

    assign(data, 'data[books][0][price]', 2)
    expect(parse(data, 'data[books][0][price]')).toBe(2)
  })

  test('keyPath as an array', () => {
    const data = {
      data: {
        books: [
          {
            name: 'ok',
            price: 10,
          }
        ]
      }
    }
    expect(parse(data, ['data', 'books', 0, 'name'])).toBe('ok')

    // use with symbol, symbol can only be used in an array
    const symb = Symbol()
    const json = {
      data: {
        [symb]: 111,
      },
    }
    expect(parse(json, ['data', symb])).toBe(111)

    assign(json, ['data', symb], 222)
    expect(parse(json, ['data', symb])).toBe(222)
  })

  test('long string with dot', () => {
    expect(makeKeyPath(['body', 'some.hand'])).toBe('body[some.hand]')

    const json = {
      data: {
        // the key has . inside, we can only use [user.role] to call it
        'user.role': 1,
        'user.name': 'tomy',
      },
    }
    expect(parse(json, 'data.user.role.')).toBeUndefined()
    expect(parse(json, 'data[user.role]')).toBe(1)
    expect(parse(json, 'data[user.name]')).toBe('tomy')
  })

  test('strict', () => {
    expect(makeKeyChain('body.hand[1].finger')).toEqual(['body', 'hand', '1', 'finger'])
    expect(makeKeyChain('body.hand[1].finger', true)).toEqual(['body', 'hand', '[1]', 'finger'])

    expect(makeKeyPath(['body', 'hand', '[1]', 'finger'])).toBe('body.hand.[1].finger')
    expect(makeKeyPath(['body', 'hand', '[1]', 'finger'], true)).toBe('body.hand[1].finger')

    expect(makeKeyPath(['body', 'hand', 1, 'finger'])).toBe('body.hand.1.finger')
    expect(makeKeyPath(['body', 'hand', 1, 'finger'], true)).toBe('body.hand[1].finger')
  })
})
