import * as fs from 'fs'
import * as path from 'path'
import { mainExtension } from '../cli/util'
import tsEslintConfig from './tsEslintConfig'

const isJsMoreTs = async entry => {
  return (await mainExtension(['js', 'ts'], entry)) === 'js'
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
  project: './tsconfig.json',
  requireConfigFile: false,
  createDefaultProgram: true,
}

module.exports = {
  // The main configuration is the current one
  root: true,
  extends: ['eslint-config-ali/react', 'plugin:prettier/recommended'],
  parser: '@babel/eslint-parser',
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
      pragma: 'React',
      version: 'detect',
    },
  },
  overrides: isTsProject
    ? [
        {
          files: ['**/*.{ts,tsx}'],
          parser: '@typescript-eslint/parser',
          plugins: ['@typescript-eslint'],
          rules: tsEslintConfig,
        },
      ]
    : [],

  parserOptions,
}
