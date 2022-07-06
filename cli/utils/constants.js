export const PACKAGE_JSON = 'package.json'

const modules = [
  {
    name: 'eslint',
    cfgConten: `module.exports = {\n  extends: [require.resolve('doohickey/standard/eslint')],\n};`,
    target: '.eslintrc.js'
  },
  {
    name: 'prettier',
    cosmiconfigOpt: {
      searchPlaces: [
        'package.json',
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.yaml',
        '.prettierrc.yml',
        '.prettierrc.json5',
        '.prettierrc.js',
        '.prettierrc.cjs',
        'prettier.config.js',
        'prettier.config.cjs',
        '.prettierrc.toml'
      ],
      loaders: {
        '.toml': () => 'toml',
        '.json5': () => 'json5'
      }
    },
    cfgConten: `const { prettier } = require('doohickey');\n\nmodule.exports = {\n  ...prettier,\n};`,
    target: '.prettier.js'
  },
  {
    name: 'stylelint',
    cfgConten: `module.exports = {\n  extends: [require.resolve('doohickey/standard/stylelint')],\n};`,
    target: '.stylelintrc.js'
  },
  {
    name: 'lint-staged',
    cfgConten: (moduleNames) => {
      let extend = {
        scripts: {
          'lint-staged': 'lint-staged'
        }
      }
      if (moduleNames.includes('eslint')) {
        extend = {
          scripts: {
            'lint-staged': 'lint-staged',
            'lint-staged:js': 'eslint --ext .js,.jsx,.ts,.tsx '
          },
          'lint-staged': {
            '**/*.{js,jsx,ts,tsx}': 'npm run lint-staged:js'
          }
        }
      }

      if (moduleNames.includes('stylelint')) {
        extend['lint-staged'] = {
          '**/*.less': 'stylelint --syntax less',
          ...(extend['lint-staged'] ?? {})
        }
      }

      if (moduleNames.includes('prettier')) {
        extend['lint-staged'] = {
          '**/*.{js,jsx,tsx,ts,less,md,json}': ['prettier --write'],
          ...(extend['lint-staged'] ?? {})
        }
      }

      return extend
    },
    target: PACKAGE_JSON
  }
]

module.exports = modules
