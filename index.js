const prettier = require('./dist/standard/prettier')

module.exports = {
  prettier,
  eslint: require.resolve('./dist/standard/eslint'),
  stylelint: require.resolve('./dist/standard/stylelint'),
}
