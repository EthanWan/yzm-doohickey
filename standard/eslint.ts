import * as fs from 'fs'
import * as path from 'path'
import { mainExtension } from '../cli/util'
import tsEslintConfig from './tsEslintConfig'

const isJsMoreTs = async path => {
  return (await mainExtension(['js', 'ts'], path)) === 'js'
}

const isTsProject = fs.existsSync(path.join(process.cwd() || '.', './tsconfig.json'))

if (isTsProject) {
  try {
    isJsMoreTs(process.cwd()).then(jsMoreTs => {
      if (!jsMoreTs) return
      console.log('Remove tsconfig.json if it’s not a TypeScript project')
    })
  } catch (error) {
    console.log(error)
  }
}

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

module.exports = {
  // The main configuration is the current one
  root: true,
  extends: [
    'google',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
  ],
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
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'require-jsdoc': 'off',
    'guard-for-in': 'off',
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
    'react-hooks/exhaustive-deps': 'error',

    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/order': 'warn',

    // unicorn
    // 'unicorn/prevent-abbreviations': 'off',
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
    react: {
      version: '18.0.0',
    },
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
