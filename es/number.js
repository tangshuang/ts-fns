/**
 * @module number
 */


import { formatString, padRight, padLeft, CHARS } from './string.js'
import { isString, isNumeric, isNumber, isNaN, isUndefined } from './is.js'

/** */
export function numerify(num) {
	if (isString(num)) {
		if (!isNumeric(num)) {
			return ''
		}
		let value = clearNum00(num)
		return value
	}
	else if (isNumber(num)) {
		let value = num.toString()
		if (value.indexOf('e')) {
			return enumerify(value)
		}
		else {
			return value
		}
	}
	else {
		return ''
	}
}

/** */
export function enumerify(input) {
  let num = parseFloat(input);
  if (isNaN(num)) {
    return ''
  }

  if (!input && input !== 0) {
    return ''
  }

  let str = input.toString()

  if (str.indexOf('e') === -1) {
    return str
  }

  let [base, exp] = str.split('e')
  let count = Number.parseInt(exp, 10)
  if (count >= 0) {
    let arr = base.split('')
    for (let i = 0; i < count; i ++) {
      let index = arr.indexOf('.')
      let next = index === arr.length - 1 ? '0' : arr[index + 1]
      arr[index] = next;
      arr[index + 1] = '.'
    }
    if (arr[arr.length - 1] === '.') {
      arr.pop()
    }
    let result = arr.join('')
    return result
  }
  else {
    let arr = base.split('')
    let rarr = arr.reverse()
    for (let i = count; i < 0; i ++) {
      let index = rarr.indexOf('.')
      let next = index === rarr.length - 1 ? '0' : rarr[index + 1]
      rarr[index] = next
      rarr[index + 1] = '.'
    }
    let rrarr = rarr.reverse()
    if (rrarr[0] === '.') {
      rrarr.unshift('0')
    }
    let result = rrarr.join('')
    return result
  }
}

/** */
export function clearNum00(input) {
  input = input.toString()
  let [ integerPart, decimalPart = '' ] = input.split('.')
  let isNegative = false
  if (integerPart.indexOf('-') === 0) {
    isNegative = true
    integerPart = integerPart.substring(1)
  }
  integerPart = integerPart.replace(/^0+/, '')
  decimalPart = decimalPart.replace(/0+$/, '')
  let value = (isNegative && (integerPart || decimalPart) ? '-' : '') + (integerPart ? integerPart : '0') + (decimalPart ? '.' + decimalPart : '')
  return value
}

/** */
export function plusby(a, b) {
  a = numerify(a)
  b = numerify(b)

  if (a === '0') {
    return b
  }
  else if (b === '0') {
    return a
  }

  let [ ia, da = '0' ] = a.split('.')
  let [ ib, db = '0' ] = b.split('.')

  let na = false
  let nb = false
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1)
    na = true
  }
  if (ib.indexOf('-') === 0) {
    ib = ib.substring(1)
    nb = true
  }

  if (na && !nb) {
    return minusby(b, a.substring(1))
  }
  if (nb && !na) {
    return minusby(a, b.substring(1))
  }

  const plus = (x, y) => {
    let xr = x.split('').reverse()
    let yr = y.split('').reverse()
    let len = Math.max(xr.length, yr.length)
    let items = []
    for (let i = 0; i < len; i ++) {
      let xv = xr[i] || '0'
      let yv = yr[i] || '0'
      items[i] = ((+xv) + (+yv)) + ''
    }

    let sum = items.reduce((sum, item, index) => {
      let sumlen = sum.length
      if (sumlen > index) {
        let borrow = sum.substring(0, 1)
        let placed = sum.substring(1)
        let next = (+borrow + +item) + ''
        return next + placed
      }
      else {
        return item + sum
      }
    }, '')
    return sum
  }

  const dalen = da.length
  const dblen = db.length
  const dlen = Math.max(dalen, dblen)
  if (dalen < dlen) {
    da = padRight(da, dlen, '0')
  }
  if (dblen < dlen) {
    db = padRight(db, dlen, '0')
  }

  const ta = ia + da
  const tb = ib + db

  let sum = plus(ta, tb)

  let sumr = sum.split('')
  let sumlen = sumr.length
  let index = sumlen - dlen
  sumr.splice(index, 0, '.')
  sum = sumr.join('')

  sum = clearNum00(sum)
  sum = sum === '' ? '0' : sum

  if (sum !== '0' && na && nb) {
    sum = '-' + sum
  }

  return sum
}

/** */
export function minusby(a, b) {
  a = numerify(a)
  b = numerify(b)

  if (b === '0') {
    return a
  }
  else if (a === '0') {
    if (b.indexOf('-') === 0) {
      return b.substring(1)
    }
    else {
      return '-' + b
    }
  }
  else if (a === b) {
    return '0'
  }

  let [ ia, da = '0' ] = a.split('.')
  let [ ib, db = '0' ] = b.split('.')

  let na = false
  let nb = false
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1)
    na = true
  }
  if (ib.indexOf('-') === 0) {
    ib = ib.substring(1)
    nb = true
  }

  if (na && !nb) {
    return plusby(a, '-' + b)
  }
  if (nb && !na) {
    return plusby(a, b.substring(1))
  }

  if (compareby(b, a) > 0) {
    let diff = minusby(b, a)
    return '-' + diff
  }

  const minus = (x, y) => {
    let xr = x.split('').reverse()
    let yr = y.split('').reverse()
    let len = Math.max(xr.length, yr.length)
    let items = []
    for (let i = 0; i < len; i ++) {
      let xv = xr[i] || '0'
      let yv = yr[i] || '0'
      items[i] = {
        xv,
        yv,
      }
    }

    let isBorrowed = false
    let diff = items.reduce((diff, item, index) => {
      let { xv, yv } = item

      xv = +xv
      yv = +yv

      if (isBorrowed) {
        xv --
      }

      if (xv < yv) {
        isBorrowed = true
        xv += 10
      }
      else {
        isBorrowed = false
      }

      let v = xv - yv
      diff = v + diff

      return diff
    }, '')

    return diff
  }

  const dalen = da.length
  const dblen = db.length
  const dlen = Math.max(dalen, dblen)
  if (dalen < dlen) {
    da = padRight(da, dlen, '0')
  }
  if (dblen < dlen) {
    db = padRight(db, dlen, '0')
  }

  const ta = ia + da
  const tb = ib + db

  let diff = minus(ta, tb)

  let diffr = diff.split('')
  let difflen = diffr.length
  let index = difflen - dlen
  diffr.splice(index, 0, '.')
  diff = diffr.join('')

  diff = clearNum00(diff)
  diff = diff === '' ? '0' : diff

  return diff
}

/** */
export function multiplyby(a, b) {
  a = numerify(a)
  b = numerify(b)

  if (a === '0' || b === '0') {
    return '0'
  }
  else if (a === '1') {
    return b
  }
  else if (b === '1') {
    return a
  }
  else if (a === '-1') {
    if (b.indexOf('-') === 0) {
      return b.substring(1)
    }
    else {
      return '-' + b
    }
  }
  else if (b === '-1') {
    if (a.indexOf('-') === 0) {
      return a.substring(1)
    }
    else {
      return '-' + a
    }
  }
  else if (/^10+/.test(b)) {
    let wei = Math.log10(b)
    let value = numerify(a)
    let [ integerPart, decimalPart = '' ] = value.split('.')
    let decimalLen = decimalPart.length
    if (decimalLen <= wei) {
      value = integerPart + padRight(decimalPart, wei, '0')
    }
    else {
      value = integerPart + decimalPart.substring(0, wei) + '.' + decimalPart.substring(wei)
    }
    value = clearNum00(value)
    return value
  }

  const multiply = (a, b) => {
    const result = []
    const aArr = a.toString().split('').map(t => parseInt(t))
    const bArr = b.toString().split('').map(t => parseInt(t))
    const aLen = aArr.length
    const bLen = bArr.length

    for (let bIndex = bLen-1; bIndex >= 0; bIndex--) {
      for (let aIndex = aLen-1; aIndex >= 0; aIndex--) {
        let index = bIndex + aIndex
        if (!result[index]) {
          result[index] = 0
        }
        result[index] += bArr[bIndex] * aArr[aIndex]
      }
    }

    result.reverse()
    for (let i = 0; i < result.length; i ++) {
      if (!result[i]) {
        result[i] = 0
      }

      let more = parseInt(result[i] / 10)
      if (more > 0) {
        if (!result[i + 1]) {
          result[i + 1] = 0
        }
        result[i + 1] += more
      }
      result[i] = result[i] % 10
    }
    result.reverse()

    return result.join('')
  }

  let [ ia, da = '0' ] = a.split('.')
  let [ ib, db = '0' ] = b.split('.')

  let na = false
  let nb = false
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1)
    na = true
  }
  if (ib.indexOf('-') === 0) {
    ib = ib.substring(1)
    nb = true
  }

  let isNegative = false
  if ((na && !nb) || (!na && nb)) {
    isNegative = true
  }

  let iProd = multiply(ia, ib)
  let dProd = multiply(da, db)

  dProd = padLeft(dProd, da.length + db.length, '0')

  let value = iProd + '.' + dProd
  value = clearNum00(value)
  value = (isNegative ? '-' : '') + value
  value = value === '' ? '0' : value

  return value
}

/** */
export function divideby(a, b, decimal) {
  if (isUndefined(decimal)) {
    decimal = divideby.InfiniteDecimalLength || 15
  }

  a = numerify(a)
  b = numerify(b)

  if (b === '0') {
    throw new Error('除数不能为0')
  }

  if (a === '0') {
    return '0'
  }
  else if (b === '1') {
    return a
  }
  else if (a === b) {
    return '1'
  }
  else if (/^10+/.test(b)) {
    let wei = Math.log10(b)
    let value = numerify(a)
    let [ integerPart, decimalPart = '' ] = value.split('.')
    let integerLen = integerPart.length
    if (integerLen <= wei) {
      value = '0.' + padLeft(integerPart, wei, '0') + decimalPart
    }
    else {
      let pos = integerLen - wei
      let left = integerPart.substring(0, pos)
      let right = integerPart.substring(pos)
      value = left + '.' + right + decimalPart
    }
    value = clearNum00(value)
    return value
  }

  let [ ib, db = '' ] = b.split('.')

  if (db.length) {
    let len = db.length
    let pow = Math.pow(10, len)
    a = multiplyby(a, pow)
    b = multiplyby(b, pow)
  }

  let [ ia, da = '' ] = a.split('.')

  let na = false
  let nb = false
  if (ia.indexOf('-') === 0) {
    ia = ia.substring(1)
    na = true
  }
  if (b.indexOf('-') === 0) {
    b = b.substring(1)
    nb = true
  }

  const divide = (x, y) => {
    const uselen = y.length
    const result = []

    let waitforcompare = x.substr(0, uselen)
    let waittouse = x.substring(uselen)

    let stillhave = waitforcompare
    let inrange = 0

    do {
      let c
      while (c = compareby(stillhave, y) >= 0) {
        if (c > 0) {
          inrange ++
          stillhave = minusby(stillhave, y)
        }
        else if (c === 0) {
          inrange ++
          stillhave = ''
          break
        }
      }

      let stillhavelen = stillhave.length
      let nextlen = uselen - stillhavelen
      nextlen = nextlen > 0 ? nextlen : 1
      waitforcompare = (stillhave === '0' ? '' : stillhave) + waittouse.substr(0, nextlen)
      waittouse = waittouse.substring(nextlen)

      result.push(inrange)
      stillhave = waitforcompare
      inrange = 0

      if (waittouse === '' && /^0+$/.test(waitforcompare)) {
        result.push(waitforcompare)
        stillhave = ''
        break
      }
    } while (compareby(stillhave, y) >= 0)

    let remainder = stillhave || '0'
    let quotient = result.join('')

    remainder = clearNum00(remainder)
    quotient = clearNum00(quotient)

    return { remainder, quotient }
  }

  let dvi = divide(ia, b)
  let { remainder, quotient } = dvi
  let value = quotient

  if (da) {
    remainder = remainder === '0' ? da : remainder + da
  }
  else {
    remainder = remainder + '0'
  }

  if (remainder && remainder !== '0') {
    let result = ''
    let nextto = remainder
    while (/[1-9]/.test(nextto)) {
      let dvd = divide(nextto, b)
      let { remainder, quotient } = dvd
      result += quotient

      if (remainder === '0') {
        break
      }

      nextto = remainder + '0'

      if (result.length > decimal) {
        break
      }
    }
    value = quotient + '.' + result
  }

  value = clearNum00(value)

  if ((na && !nb) || (!na && nb)) {
    value = '-' + value
  }

  return value
}

/** */
export function compareby(a, b) {
  a = numerify(a)
  b = numerify(b)

  let [ ia, da = '' ] = a.split('.')
  let [ ib, db = '' ] = b.split('.')

  const compare2 = (n, m) => {
    if (n.length > m.length) {
      return 1
    }
    else if (n.length < m.length) {
      return -1
    }
    else {
      for (let i = 0, len = n.length; i < len; i ++) {
        let nv = n.charAt(i)
        let mv = m.charAt(i)
        if (+nv > +mv) {
          return 1
        }
        else if (+nv < +mv) {
          return -1
        }
      }
      return 0
    }
  }

  const compare = (x, y) => {
    let nx = x.indexOf('-') === 0
    let ny = y.indexOf('-') === 0

    if (!nx && ny) {
      return 1
    }
    else if (nx && !ny) {
      return -1
    }
    else if (nx && ny) {
      x = x.substring(1)
      y = y.substring(1)
      let result = compare2(x, y)
      return -result
    }
    else if (!nx && !ny) {
      return compare2(x, y)
    }
  }

  const ci = compareby(ia, ib)
  if (ci) {
    return ci
  }

  const dalen = da.length
  const dblen = db.length
  const dlen = Math.max(dalen, dblen)
  if (dalen < dlen) {
    da = padRight(da, dlen, '0')
  }
  if (dblen < dlen) {
    db = padRight(db, dlen, '0')
  }
  const cd = compareby(da, db)
  if (cd) {
    return cd
  }

  return 0
}

/** */
export function calculate(exp, decimal) {
  const contains = (str, items) => {
    for (let i = 0, len = items.length; i < len; i ++) {
      let item = items[i]
      if (str.indexOf(item) > -1) {
        return true
      }
    }
    return false
  }

  if (!/^[\(\-]?[0-9]+[0-9\+\-\*\/\(\)]*[0-9\)]$/.test(exp)) {
    throw new Error(`exp contains unexpected content.`)
  }
  if (contains(exp, ['---', '++', '**', '//'])) {
    throw new Error(`exp contains one of ['---', '++', '**', '//'].`)
  }
  if (contains(exp, ['-*', '-/', '+*', '+/'])) {
    throw new Error(`exp contains one of ['-*', '-/', '+*', '+/'].`)
  }
  if (exp.indexOf(')(') > -1) {
    throw new Error(`exp contains ')('.`)
  }
  if (exp.indexOf('()') > -1) {
    throw new Error(`exp contains empty sub-exp '()'.`)
  }
  if (/\)[0-9]/.test(exp)) {
    throw new Error(`exp contains number which follows ')'.`)
  }
  if (/[0-9]\(/.test(exp)) {
    throw new Error(`exp contians '(' which follows number.`)
  }

  const parse = (exp) => {
    let inGroup = 0
    let exparr = []
    let expstr = ''
    let groups = []
    let groupstr = ''
    for (let i = 0, len = exp.length; i < len; i ++) {
      let char = exp.charAt(i)
      if (char === '(') {
        if (inGroup) {
          groupstr += char
        }
        else {
          if (expstr) {
            exparr.push(expstr)
            expstr = ''
          }
        }
        inGroup ++
      }
      else if (char === ')') {
        if (!inGroup) {
          throw new Error(`exp has unexpected ')': ... ${groupstr})`)
        }

        if (inGroup === 1) {
          if (groupstr) {
            let index = groups.length
            exparr.push(index)
            groups.push(groupstr)
            groupstr = ''
          }
        }
        else {
          groupstr += char
        }
        inGroup --
      }
      else if (inGroup) {
        groupstr += char
      }
      else {
        if (/[\+\-\*\/]/.test(char)) {
          if (expstr) {
            exparr.push(expstr)
          }
          expstr = ''
          exparr.push(char)
        }
        else {
          expstr += char
        }
      }
    }

    if (inGroup) {
      throw new Error(`exp '(' is not closed.`)
    }

    if (expstr) {
      exparr.push(expstr)
    }

    const exparr2 = []
    for (let i = 0, len = exparr.length; i < len; i ++) {
      const current = exparr[i]
      const prev = exparr[i - 1]
      const next = exparr[i + 1]
      if (current === '-') {
        if (i === 0 || inArray(prev, ['*', '/', '+', '-'])) {
          if (next === '-') {
            i ++
            continue
          }
          else if (next === '+') {
            let nextnext = exparr[i + 2]
            let text = '-' + nextnext
            exparr2.push(text)
            i += 2
          }
          else {
            let text = '-' + next
            exparr2.push(text)
            i ++
          }
        }
        else {
          exparr2.push(current)
        }
      }
      else {
        exparr2.push(current)
      }
    }

    const expsrc = []
    exparr2.forEach((item, i) => {
      if (isNumber(item)) {
        item = groups[item]
        item = parse(item)
      }
      expsrc.push(item)
    })

    let expast = []

    if (contains(exp, ['+', '-']) && contains(exp, ['*', '/'])) {
      let combine = []
      let started = false
      for (let i = 0; i < expsrc.length; i ++) {
        let current = expsrc[i]
        if (!started && (current === '*' || current === '/')) {
          let prev = expast.pop()
          combine.push(prev)
          combine.push(current)
          started = true
        }
        else if (started) {
          if (current === '+' || (!inArray(combine[combine.length - 1], ['*', '/']) && current === '-')) {
            expast.push(combine)
            expast.push(current)
            started = false
            combine = []
          }
          else if (i === (expsrc.length - 1)) {
            combine.push(current)
            expast.push(combine)
            started = false
            combine = []
          }
          else {
            combine.push(current)
          }
        }
        else {
          expast.push(current)
        }
      }
    }
    else {
      expast = expsrc
    }

    return expast
  }

  const execute = (expast) => {
    const exparr = []
    expast.forEach((item) => {
      if (isArray(item)) {
        item = execute(item)
      }
      exparr.push(item)
    })

    let expres = []
    const leftres = []
    const rightres = []
    for (let i = 0, len = exparr.length; i < len; i ++) {
      const current = exparr[i]
      const next = exparr[i + 1]
      if (current === '*') {
        leftres.push(current)
        leftres.push(next)
        i ++
      }
      else if (current === '/') {
        rightres.push(current)
        rightres.push(next)
        i ++
      }
      else {
        expres.push(current)
      }
    }
    expres = expres.concat(leftres).concat(rightres)

    let result = ''
    for (let i = 0, len = expres.length; i < len; i ++) {
      let current = expres[i]
      if (i === 0) {
        result = current === '-' ? '0' : current
      }
      if (/[\+\-\*\/]/.test(current)) {
        let next = expres[i + 1]
        if (current === '+') {
          result = plusby(result, next)
        }
        else if (current === '-') {
          result = minusby(result, next)
        }
        else if (current === '*') {
          result = multiplyby(result, next)
        }
        else if (current === '/') {
          result = divideby(result, next, decimal)
        }
      }
    }

    return result
  }

  const expast = parse(exp)
  const result = execute(expast)
  return result
}

/** */
export function fixNum(input, decimal = 2, pad = false, floor = false) {
  let num = parseFloat(input)
  if (isNaN(num)) {
    return ''
  }

  let value = numerify(input)
  let [ integerPart, decimalPart = '' ] = value.split('.')

  const plusOneToTail = (dnum) => {
    let [ integerPart, decimalPart ] = dnum.split('.')
    let dlen = decimalPart.length
    let one = '0.' + padLeft('1', dlen, '0')
    let value = plusby(dnum, one)
    return value
  }

  if (decimal === 0 && floor) {
    if (decimalPart && num < 0) {
      integerPart = minusby(integerPart, '1')
    }
    value = integerPart
  }
  else if (decimal === 0) {
    if (decimalPart && +('0.' + decimalPart) >= 0.5) {
      if (num >= 0) {
        integerPart = plusby(integerPart, '1')
      }
      else {
        integerPart = minusby(integerPart, '1')
      }
    }
    value = integerPart
  }
  else if (decimal > 0 && floor) {
    let isNegative = num < 0
    if (decimalPart) {
      if (isNegative) {
        let usePart = decimalPart.substr(0, decimal)
        let dropPart = decimalPart.substring(decimal)

        usePart = '0.' + usePart

        if (dropPart) {
          usePart = plusOneToTail(usePart)
        }

        value = minusby(integerPart, usePart)
      }
      else {
        value = integerPart + '.' + decimalPart.substr(0, decimal)
      }
    }
    else {
      value = integerPart
    }
  }
  else if (decimal > 0) {
    value = integerPart
    if (decimalPart) {
      let usePart = decimalPart.substr(0, decimal)
      let dropPart = decimalPart.substr(decimal, 1)

      usePart = '0.' + usePart

      if (+dropPart >= 5) {
        usePart = plusOneToTail(usePart)
      }

      let isNegative = num < 0
      if (isNegative) {
        value = minusby(integerPart, usePart)
      }
      else {
        value = plusby(integerPart, usePart)
      }
    }
  }

  value = clearNum00(value)

  if (pad) {
    let [ integerPart, decimalPart = '' ] = value.split('.')
    if ((decimalPart && decimalPart.length < decimal) || !decimalPart) {
      decimalPart = padRight(decimalPart || '', decimal, '0')
      value = integerPart + '.' + decimalPart
    }
  }

  return value
}

/** */
export function formatNum(input, separator, count, formatdecimal = false) {
  if (!input) {
    return '';
  }

  let num = input.toString();

  if (!/^\-{0,1}[0-9]+(\.{0,1}[0-9]+){0,1}$/.test(num)) {
    return '';
  }

  let blocks = num.split(/\-|\./);
  let isNegative = num.charAt(0) === '-';
  let integer;
  let decimal;

  if (isNegative) {
    integer = blocks[1];
    decimal = blocks[2] || '';
  }
  else {
    integer = blocks[0];
    decimal = blocks[1] || '';
  }

  integer = formatString(integer, separator, count, true);
  if (formatdecimal && decimal) {
    decimal = formatString(decimal, separator, count);
  }

  let result = '';
  if (isNegative) {
    result += '-';
  }

  result += integer;

  if (decimal) {
    result += '.' + decimal;
  }

  return result;
}

/** */
export function formatNum1000(input, formatdecimal = false) {
  return formatNumber(input, ',', 3, formatdecimal);
}

// http://www.softwhy.com/article-4813-1.html
/** */
export function num10to62(num) {
  const chars = CHARS.split('')
  const radix = chars.length
  const arr = []
  let qutient = +num
  do {
    const mod = qutient % radix
    qutient = (qutient - mod) / radix
    arr.unshift(chars[mod])
  }
  while (qutient)
  const code = arr.join('')
  return code
}
/** */
export function num62to10(code) {
  const radix = CHARS.length
  const len = code.length
  let i = 0
  let num = 0
  while (i < len) {
    num += Math.pow(radix, i++) * CHARS.indexOf(code.charAt(len - i) || 0)
  }
  return num
}
