import { parse, assign } from '../es/key-path.js'

describe('assign', () => {
  it('deep array item object', () => {
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
})
