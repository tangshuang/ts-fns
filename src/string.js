/**
 * @module string
 */

import { createArray } from './array.js'

export function formatStringBy(input, separator, segments, alignright) {
  if (typeof input !== 'string' || !input) {
    return ''
  }
  if (typeof separator !== 'string' || !separator) {
    return input
  }
  if (!segments) {
    return input
  }

  let letters = input.split('')

  if (alignright) {
    letters.reverse()
  }

  let points = Array.isArray(segments) ? [].concat(segments) : [segments]
  let result = []
  let count = points[0]

  for (let i = 0, len = letters.length; i < len; i ++) {
    if (typeof segments === 'number') {
      if (i > 0 && i % count === 0) {
        result.push(separator)
      }
    }
    else if (Array.isArray(segments) && points.length) {
      if (i > 0 && i % count === 0) {
        result.push(separator)
        points.shift()
        count += points.length ? points[0] : 0
      }
    }

    let char = letters[i]
    result.push(char)
  }

  if (alignright) {
    result.reverse()
  }

  let output = result.join('')
  return output
}

export function padLeft(str, len, pad) {
  if (str.length >= len) {
    return str
  }

  let diff = len - str.length
  let letters = createArray(pad, diff)

  return letters.join('') + str
}

export function padRight(str, len, pad) {
  if (str.length >= len) {
    return str
  }

  let diff = len - str.length
  let letters = createArray(pad, diff)

  return str + letters.join('')
}

export function getStringHash(str) {
  let hash = 5381
  let i = str.length

  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  return hash >>> 0
}

export function createRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = ''
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return text
}

// https://github.com/gillesruppert/node-interpolate/blob/master/lib/interpolate.js
export function interpolate(template, data, opts) {
  let regex,
    lDel,
    rDel,
    delLen,
    lDelLen,
    delimiter,
    // For escaping strings to go in regex
    regexEscape = /([$\^\\\/()|?+*\[\]{}.\-])/g;

  opts = opts || {};

  delimiter = opts.delimiter || '{}';
  delLen = delimiter.length;
  lDelLen = Math.ceil(delLen / 2);
  // escape delimiters for regex
  lDel = delimiter.substr(0, lDelLen).replace(regexEscape, "\\$1");
  rDel = delimiter.substr(lDelLen, delLen).replace(regexEscape, "\\$1") || lDel;

  // construct the new regex
  regex = new RegExp(lDel + "[^" + lDel + rDel + "]+" + rDel, "g");

  return template.replace(regex, function (placeholder) {
    let key = placeholder.slice(lDelLen, -lDelLen),
      keyParts = key.split("."),
      val,
      i = 0,
      len = keyParts.length;

    if (key in data) {
      // need to be backwards compatible with "flattened" data.
      val = data[key];
    }
    else {
      // look up the chain
      val = data;
      for (; i < len; i++) {
        if (keyParts[i] in val) {
          val = val[ keyParts[i] ];
        } else {
          return placeholder;
        }
      }
    }
    return val;
  });
}
