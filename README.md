# ts-fns

Low level javascript functions.
All written by ES6+.

## usage

```
npm i ts-fns
```

```js
import { createProxy } from 'ts-fns'
```

## modules

es: in `es` dir, export by `module` field

commonjs: in `cjs` dir, export by `main` field

bundle: in `dist` dir, with `umd`, without exporting, you should use it by manually, can be used in browsers by requiring `const { each } = window['ts-fns']`

## docs

git clone this repo, and run

```
npm i
npm run docs
```

And then open docs/index.html to view docs.
