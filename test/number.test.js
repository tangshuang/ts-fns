import { fixNumber, num10to62, num62to10 } from '../es/number.js'

describe('number', () => {
  it('fixNumber', () => {
    const num = '12.351'
    expect(fixNumber(num)).toBe('12.35')
    expect(fixNumber(num, 1)).toBe('12.4')
  })
  it('num10to62', () => {
    expect(num10to62(100)).toBe('1C')
  })
  it('num62to10', () => {
    expect(num62to10('1C')).toBe(100)
  })
})
