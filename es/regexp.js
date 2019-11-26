/**
 * @module regexp
 */

/** */
export function createSafeExp(exp) {
  const sign = '*.?+$^[](){}|\\/'
  const signArr = sign.split('')
  const expArr = exp.split('')
  const expList = expArr.map(char => signArr.indexOf(char) > -1 ? '\\' + char : char)
  const safeExp = expList.join('')
  return safeExp
}
