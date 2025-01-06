import { fixNum, num10to62, num62to10, divideby, multiplyby, formatNum1000 } from '../es/number.js'

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

  it('multiplyby decimal', () => {
    expect(multiplyby(1343, '0.01')).toBe('13.43')
    expect(multiplyby(1.2, 1.2)).toBe('1.44')
  })

  it('divideby decimal', () => {
    expect(divideby(1.2, 1.2)).toBe('1')
    expect(divideby(1.2, 0.2)).toBe('6')
    expect(divideby(1.2, 0.1)).toBe('12')
    expect(divideby(1.2, 0.01)).toBe('120')
    expect(divideby(123, 0.01)).toBe('12300')
  })

  it('formatNum1000(0)', () => {
    expect(formatNum1000(0)).toBe('0')
    expect(formatNum1000('0')).toBe('0')
    expect(formatNum1000(null)).toBe('')
  })
})
