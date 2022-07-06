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
      let extension = {
        scripts: {
          'lint-staged': 'lint-staged'
        }
      }
      if (moduleNames.includes('eslint')) {
        extension = {
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
        extension['lint-staged'] = {
          '**/*.less': 'stylelint --syntax less',
          ...(extension['lint-staged'] ?? {})
        }
      }

      if (moduleNames.includes('prettier')) {
        extension['lint-staged'] = {
          '**/*.{js,jsx,tsx,ts,less,md,json}': ['prettier --write'],
          ...(extension['lint-staged'] ?? {})
        }
      }

      return extension
    },
    target: PACKAGE_JSON
  }
]

module.exports = modules
