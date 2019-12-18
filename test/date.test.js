import { formatDate, createDate } from '../es/date.js'

describe('date', () => {
  test('formatDate', () => {
    const date = formatDate('2019/12/04 12:30', 'YYYY-MM-DD s', 'YYYY/MM/DD HH:mm')
    expect(date).toBe('2019-12-04 0')

    const d2 = new Date('2019-02-12 08:09:23')
    const date2 = formatDate(d2, 'YY-MM')
    expect(date2).toBe('19-02')

    const date3 = formatDate('2019-12-04 12:30', 'DD\\D')
    expect(date3).toBe('04D')

    const date4 = formatDate('2019-06-27 08:32 pm', 'HH:mm', 'YYYY-MM-DD hh:mm a')
    expect(date4).toBe('20:32')

    const date5 = formatDate('Jun', 'MM', 'MMM')
    expect(date5).toBe('06')

    const date6 = formatDate('2019-02-12 08:09:23.037', 'S')
    expect(date6).toBe('37')
    const date7 = formatDate('2019-02-12 08:09:23.037', 'SSS')
    expect(date7).toBe('037')

    // the ms .37 means .370 in fact
    const date61 = formatDate('2019-02-12 08:09:23.37', 'S')
    expect(date61).toBe('370')
    const date71 = formatDate('2019-02-12 08:09:23.37', 'SSS')
    expect(date71).toBe('370')
  })
  test("createDate", () => {
    const date = createDate(new Date("2019-12-02"))
    expect(date.getFullYear()).toBe(2019)
    expect(date.getMonth()).toBe(11)
    expect(date.getDate()).toBe(2)
  })
})
