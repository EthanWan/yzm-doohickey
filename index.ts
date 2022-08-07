const prettier = require('./standard/prettier')

module.exports = {
  prettier,
  eslint: require.resolve('./standard/eslint'),
  stylelint: require.resolve('./standard/stylelint'),
}
