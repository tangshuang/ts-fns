const path = require('path')
const babelConfig = require('./babel.config')

const root = path.resolve(__dirname)

// make effect
babelConfig.presets[0][1].modules = false
babelConfig.plugins[0][1] = { useESModules: true }

const config = {
  mode: 'none',
  entry: path.resolve(root, 'es/index.js'),
  output: {
    path: path.resolve(root, 'umd'),
    filename: 'ts-fns.js',
    library: 'ts-fns',
    libraryTarget: 'umd',
    globalObject: `typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : this`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: babelConfig,
      },
    ],
  },
  optimization: {
    minimize: false,
    usedExports: true,
    sideEffects: true,
  },
  devtool: 'source-map',
}

const mini = {
  ...config,
  output: {
    ...config.output,
    filename: 'ts-fns.min.js',
  },
  optimization: {
    ...config.optimization,
    minimize: true,
  },
}

module.exports = [
  config,
  mini,
]
