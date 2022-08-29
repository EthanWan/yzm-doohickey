const fs = require('fs')
const path = require('path')
const useTailwind = fs.existsSync(path.join(process.cwd() || '.', './tailwind.config.js'))

module.exports = {
  extends: [
    // https://github.com/stylelint/stylelint-config-standard
    // Including: The Idiomatic CSS Principles, Google's CSS Style Guide,
    // Airbnb's Styleguide, and @mdo's Code Guide.
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-prettier',
  ],
  plugins: ['stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'no-descending-specificity': null,
    'function-url-quotes': 'always',
    'selector-attribute-quotes': 'always',
    // iconfont
    'font-family-no-missing-generic-family-keyword': null,
    'plugin/declaration-block-no-ignored-properties': true,
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    // webcomponent
    'selector-type-no-unknown': null,
    'value-keyword-case': ['lower', { ignoreProperties: ['composes'] }],
    // ignore tailwind rules, 通过判断可以添加
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: useTailwind ? [
          "tailwind",
          "layer",
          "apply",
          "variants",
          "responsive",
          "screen"
        ] : []
      }
    ],
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
}
