/**
 * @module datetime
 */

const pad = num => num < 10 ? '0' + num : num + ''
export const DATE_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
export const DATE_WEEKS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thur',
  'Fri',
  'Sat',
]
export const DATE_EXPS = {
  YYYY: '[12][0-9]{3}',
  YY: '[0-9]{2}',
  M: '[1-9]|1[0-2]',
  MM: '0[1-9]|1[0-2]',
  MMM: DATE_MONTHS.join('|'),
  D: '[1-9]|[1-2][0-9]|3[0-1]',
  DD: '[0-2][0-9]|3[0-1]',
  W: '[0-6]',
  WWW: DATE_WEEKS.join('|'),
  H: '[0-9]|1[0-9]|2[0-3]',
  HH: '[01][0-9]|2[0-3]',
  h: '[0-9]|1[0-2]',
  hh: '0[0-9]|1[0-2]',
  a: 'am|pm',
  A: 'AM|PM',
  m: '[0-9]|[1-5][0-9]',
  mm: '[0-5][0-9]',
  s: '[0-9]|[1-5][0-9]',
  ss: '[0-5][0-9]',
  S: '[0-9]|[1-9][0-9]|[1-9][0-9]{2}',
  SSS: '[0-9]{3}',
}
export const DATE_FORMATTERS = {
  YYYY: date => date.getFullYear() + '',
  YY: date => (date.getFullYear() % 100) + '',
  M: date => (date.getMonth() + 1) + '',
  MM: date => pad(date.getMonth() + 1),
  MMM: date => DATE_MONTHS[date.getMonth()],
  D: date => date.getDate() + '',
  DD: date => pad(date.getDate()),
  W: date => date.getDay() + '',
  WWW: date => DATE_WEEKS[date.getDay()],
  H: date => date.getHours() + '',
  HH: date => pad(date.getHours()),
  h: date => date.getHours() % 12 + '',
  hh: date => pad(date.getHours() % 12),
  a: date => date.getHours() < 12 ? 'am' : 'pm',
  A: date => date.getHours() < 12 ? 'AM' : 'PM',
  m: date => date.getMinutes() + '',
  mm: date => pad(date.getMinutes()),
  s: date => date.getSeconds() + '',
  ss: date => pad(date.getSeconds()),
  SSS: date => date.getMilliseconds() + '',
}
const getFormatterKeys = () => {
  const parserKeys = Object.keys(DATE_EXPS)
  parserKeys.sort()
  parserKeys.reverse()
  return parserKeys
}
const getFormatterString = (formatter) => {
  const sign = '*.?+$^[](){}|\\/'
  const signArr = sign.split('')
  const formatterArr = formatter.split('')
  const formatterList = formatterArr.map(char => signArr.indexOf(char) > -1 ? '\\' + char : char)
  const formatterStr = formatterList.join('')
  return formatterStr
}
const parseFormatter = (formatter, fn) => {
  const parserKeys = getFormatterKeys()
  const formatterExp = '(?<!\\\\)(' + parserKeys.join('|') + ')'
  const formatterReg = new RegExp(formatterExp, 'g')

  const formatterStr = getFormatterString(formatter)
  const output = formatterStr.replace(formatterReg, (matched, found) => {
    if (typeof fn === 'function') {
      return fn(found)
    }
    return found
  })

  return output
}
const parseDate = (dateString, formatter) => {
  const foundParsers = []
  const dateExp = parseFormatter(formatter, (found) => {
    foundParsers.push(found)
    return '(' + DATE_EXPS[found] + ')'
  })
  const dateReg = new RegExp(dateExp)

  if (!dateReg.test(dateString)) {
    return null
  }

  const dateFound = []
  dateString.replace(dateReg, (matched, ...founds) => {
    dateFound.push(...founds)
  })

  const dateRes = {}
  foundParsers.forEach((key, i) => {
    if (dateRes[key]) {
      return
    }
    dateRes[key] = dateFound[i]
  })

  return dateRes
}

export function createDate(dateString, givenFormatter) {
  if (!givenFormatter) {
    return new Date(dateString)
  }

  const parsedDate = parseDate(dateString, givenFormatter)
  if (!parsedDate) {
    return new Date(dateString)
  }

  const Y = +(parsedDate.YYYY || ('20' + parsedDate.YY)) || (new Date().getFullYear())
  const D = +(parsedDate.DD || parsedDate.D) || 1
  const m = +(parsedDate.mm || parsedDate.m) || 0
  const s = +(parsedDate.ss || parsedDate.s) || 0

  var M
  if (parsedDate.MM || parsedDate.M) {
    M = +(parsedDate.MM || parsedDate.M) - 1 || 0
  }
  else if (parsedDate.MMM) {
    let m = parsedDate.MMM
    let i = DATE_MONTHS.indexOf(m)
    i = i === - 1 ? 0 : i
    M = i
  }
  else {
    M = 0
  }

  var H
  if (parsedDate.HH || parsedDate.H) {
    H = +(parsedDate.HH || parsedDate.H) || 0
  }
  else if (parsedDate.hh || parsedDate.h) {
    let a = (parsedDate.a || parsedDate.A || 'am').toLowerCase()
    let h = +(parsedDate.hh || parsedDate.h) || 0
    H = a === 'pm' ? h + 12 : h
  }
  else {
    H = 0
  }

  return new Date(Y, M, D, H, m, s)
}

export function formatDate(datetime, formatter, givenFormatter) {
  if (!datetime) {
    return
  }
  if (!formatter) {
    return
  }

  const date = createDate(datetime, givenFormatter)
  const output = parseFormatter(formatter, (found) => {
    const format = DATE_FORMATTERS[found]
    if (format) {
      return format(date)
    }
    else {
      return found
    }
  })

  const parserKeys = getFormatterKeys()
  const formatterExp = '\\\\\\\\(' + parserKeys.join('|') + ')'
  const formatterReg = new RegExp(formatterExp, 'g')

  const res = output.replace(formatterReg, (matched, found) => {
    return found
  })

  return res
}
