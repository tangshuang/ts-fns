import { parse, assign, makeKeyPath } from '../es/key-path.js'

describe('assign', () => {
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
  })
  test('strict', () => {
    expect(makeKeyPath(['body', 'hand', '[1]', 'finger'], true)).toBe('body.hand[1].finger')
    expect(makeKeyPath(['body', 'hand', '1', 'finger'], true)).toBe('body.hand.1.finger')
  })
})
