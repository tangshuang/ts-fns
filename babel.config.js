module.exports = {
  presets: [
    ['@babel/preset-env', { debug: true }],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          exclude: [
            '@babel/plugin-transform-arrow-functions',
            '@babel/plugin-transform-classes'
          ],
        }],
      ],
    },
  },
}
