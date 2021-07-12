import { fixNum, num10to62, num62to10, divideby } from '../es/number.js'

describe('number', () => {
  it('fixNum', () => {
    const num = '12.351'
    expect(fixNum(num)).toBe('12.35')
    expect(fixNum(num, 1)).toBe('12.4')
  })
  it('num10to62', () => {
    expect(num10to62(100)).toBe('1C')
  })
  it('num62to10', () => {
    expect(num62to10('1C')).toBe(100)
  })

  it('divideby', () => {
    const decimalNum = divideby(1111, 111, 5)
    expect(decimalNum).toBe('1.009')
  })
})
