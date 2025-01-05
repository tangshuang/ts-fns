const path = require('path')
const DeepScopePlugin = require('webpack-deep-scope-plugin').default
const babelConfig = require('./babel.config.js')

const root = path.resolve(__dirname)

const config = {
  mode: 'none',
  entry: path.resolve(root, 'es/index.js'),
  output: {
    path: path.resolve(root, 'dist'),
    filename: 'index.js',
    library: 'ts-fns',
    libraryTarget: 'umd',
    globalObject: `typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : this`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          ...babelConfig,
          presets: [
            ['@babel/preset-env', { modules: false }],
          ],
        },
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
  mode: 'production',
  output: {
    ...config.output,
    filename: 'index.min.js',
  },
  optimization: {
    ...config.optimization,
    minimize: true,
  },
  plugins: [
    new DeepScopePlugin(),
  ],
}

module.exports = [
  config,
  mini,
]
