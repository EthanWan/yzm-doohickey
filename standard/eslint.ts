const fs = require('fs')
const path = require('path')
const tsEslintConfig = require('./tsEslintConfig')

const parserOptions = {
  ecmaFeatures: {
    jsx: true,
  },
  babelOptions: {
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
  },
  requireConfigFile: false,
  project: './tsconfig.json',
}

const isDirExists = path => {
  return new Promise(resolve => {
    fs.stat(path, (error, stats) => {
      if (error) return resolve(false)
      return resolve(stats.isDirectory())
    })
  })
}

const isJsMoreTs = async (path = 'src') => {
  let srcEnter = `${path}/src`
  // Nextjs main enter
  if (await isDirExists(`${path}/pages`)) {
    srcEnter = `${path}/pages`
  }

  const fg = require('fast-glob')
  const jsFiles = await fg(`${srcEnter}/**/*.{js,jsx}`, { deep: 3 })
  const tsFiles = await fg(`${srcEnter}/**/*.{ts,tsx}`, { deep: 3 })

  return jsFiles.length >= tsFiles.length
}

const isTsProject = fs.existsSync(path.join(process.cwd() || '.', './tsconfig.json'))

if (isTsProject) {
  try {
    isJsMoreTs(process.cwd()).then(jsMoreTs => {
      if (!jsMoreTs) return
      console.log('Remove tsconfig.json if it’s not a TypeScript project')
    })
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  extends: ['plugin:prettier/recommended', 'plugin:react/recommended'],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'unicorn', 'react-hooks', 'import'],
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  rules: {
    strict: ['error', 'never'],
    'react/display-name': 0,
    'react/jsx-props-no-spreading': 0,
    'react/state-in-constructor': 0,
    'react/static-property-placement': 0,
    // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'react/no-array-index-key': 'warn',
    'react/require-default-props': 0,
    'react/jsx-fragments': 0,
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/forbid-prop-types': 0,
    'react/sort-comp': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-one-expression-per-line': 0,

    // eslint-plugin-react-hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/order': 'warn',

    'unicorn/prevent-abbreviations': 'off',

    // 'generator-star-spacing': 0,
    // 'function-paren-newline': 0,
    // 'sort-imports': 0,
    // 'class-methods-use-this': 0,
    // 'no-confusing-arrow': 0,
    // 'linebreak-style': 0,
    // // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    // 'no-prototype-builtins': 'off',
    // 'arrow-parens': 0,
    // 'object-curly-newline': 0,
    // 'implicit-arrow-linebreak': 0,
    // 'operator-linebreak': 0,
    // 'no-param-reassign': 2,
    // 'space-before-function-paren': 0,
    // 'array-callback-return': 'warn',
    // 'default-case': ['warn', { commentPattern: '^no default$' }],
    // 'dot-location': ['warn', 'property'],
    // eqeqeq: ['warn', 'smart'],
    // 'new-parens': 'warn',
    // 'no-array-constructor': 'warn',
    // 'no-caller': 'warn',
    // 'no-cond-assign': ['warn', 'except-parens'],
    // 'no-const-assign': 'error',
    // 'no-control-regex': 'warn',
    // 'no-delete-var': 'warn',
    // 'no-dupe-args': 'warn',
    // 'no-dupe-class-members': 'warn',
    // 'no-dupe-keys': 'warn',
    // 'no-duplicate-case': 'warn',
    // 'no-empty-character-class': 'warn',
    // 'no-empty-pattern': 'warn',
    // 'no-eval': 'warn',
    // 'no-ex-assign': 'warn',
    // 'no-extend-native': 'warn',
    // 'no-extra-bind': 'warn',
    // 'no-extra-label': 'warn',
    // 'no-fallthrough': 'warn',
    // 'no-func-assign': 'warn',
    // 'no-implied-eval': 'warn',
    // 'no-invalid-regexp': 'warn',
    // 'no-iterator': 'warn',
    // 'no-label-var': 'warn',
    // 'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
    // 'no-lone-blocks': 'warn',
    // 'no-loop-func': 'warn',
    // 'no-mixed-operators': [
    //   'warn',
    //   {
    //     groups: [
    //       ['&', '|', '^', '~', '<<', '>>', '>>>'],
    //       ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
    //       ['&&', '||'],
    //       ['in', 'instanceof'],
    //     ],
    //     allowSamePrecedence: false,
    //   },
    // ],
    // 'no-multi-str': 'warn',
    // 'no-native-reassign': 'warn',
    // 'no-negated-in-lhs': 'warn',
    // 'no-new-func': 'warn',
    // 'no-new-object': 'warn',
    // 'no-new-symbol': 'warn',
    // 'no-new-wrappers': 'warn',
    // 'no-obj-calls': 'warn',
    // 'no-octal': 'warn',
    // 'no-octal-escape': 'warn',
    // 'no-redeclare': ['warn', { builtinGlobals: false }],
    // 'no-regex-spaces': 'warn',
    // 'no-restricted-syntax': ['warn', 'WithStatement'],
    // 'no-script-url': 'warn',
    // 'no-self-assign': 'warn',
    // 'no-self-compare': 'warn',
    // 'no-sequences': 'warn',
    // 'no-shadow-restricted-names': 'warn',
    // 'no-sparse-arrays': 'warn',
    // 'no-template-curly-in-string': 'warn',
    // 'no-this-before-super': 'warn',
    // 'no-throw-literal': 'warn',
    // 'no-undef': 'error',
    // 'no-unexpected-multiline': 'warn',
    // 'no-unreachable': 'warn',
    // 'no-unused-expressions': [
    //   'error',
    //   {
    //     allowShortCircuit: true,
    //     allowTernary: true,
    //     allowTaggedTemplates: true,
    //   },
    // ],
    // 'no-unused-labels': 'warn',
    // 'no-unused-vars': [
    //   'warn',
    //   {
    //     args: 'none',
    //     ignoreRestSiblings: true,
    //   },
    // ],
    // 'no-use-before-define': [
    //   'warn',
    //   {
    //     functions: false,
    //     classes: false,
    //     variables: false,
    //   },
    // ],
    // 'no-useless-computed-key': 'warn',
    // 'no-useless-concat': 'warn',
    // 'no-useless-constructor': 'warn',
    // 'no-useless-escape': 'warn',
    // 'no-useless-rename': [
    //   'warn',
    //   {
    //     ignoreDestructuring: false,
    //     ignoreImport: false,
    //     ignoreExport: false,
    //   },
    // ],
    // 'no-with': 'warn',
    // 'no-whitespace-before-property': 'warn',
    // 'require-yield': 'warn',
    // 'rest-spread-spacing': ['warn', 'never'],
    // 'unicode-bom': ['warn', 'never'],
    // 'use-isnan': 'warn',
    // 'valid-typeof': 'warn',
    // 'no-restricted-properties': [
    //   'error',
    //   {
    //     object: 'require',
    //     property: 'ensure',
    //     message:
    //       'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
    //   },
    //   {
    //     object: 'System',
    //     property: 'import',
    //     message:
    //       'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
    //   },
    // ],
    // 'getter-return': 'warn',
    // 'no-var': 'warn',
    // 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  // Shared Settings
  settings: {
    // support import modules from TypeScript files in JavaScript files
    'import/resolver': {
      node: {
        extensions: isTsProject
          ? ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
          : ['.js', '.jsx'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
    },
    'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
    'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    polyfills: ['fetch', 'Promise', 'URL', 'object-assign'],
  },
  overrides: isTsProject
    ? [
        {
          files: ['**/*.{ts,tsx}'],
          parser: '@typescript-eslint/parser',
          extends: ['plugin:@typescript-eslint/recommended'],
          rules: tsEslintConfig,
        },
      ]
    : [],

  parserOptions,
}
