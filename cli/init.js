const { exec } = require('child_process')
const { copyFile, writeFile, access } = require('fs/promises')
const path = require('path')
const { cosmiconfig } = require('cosmiconfig')
const chalk = require('chalk')
const ora = require('ora')

const spinner = ora()

module.exports = async function init(args) {
  const defaultAction = Object.keys(args).length === 1
  let modules = []

  console.log('')
  if (args.e || args.eslint || defaultAction) {
    await configExists('eslint')

    writeFile(
      './.eslintrc.js',
      `module.exports = {\n  extends: [require.resolve('doohickey/standard/eslint')],\n};`
    )
    modules.push('eslint')
  }

  if (args.p || args.prettier || defaultAction) {
    await configExists('prettier', {
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
    })

    access('.edtorconfig').catch((_) => {
      copyFile(path.resolve(__dirname, '../.editorconfig'), `.editorconfig`)
    })

    writeFile(
      './.prettierrc.js',
      `const { prettier } = require('doohickey');\n\nmodule.exports = {\n  ...prettier,\n};`
    )
    modules.push('prettier')
  }

  if (args.s || args.stylelint || defaultAction) {
    await configExists('stylelint')

    writeFile(
      './.stylelintrc.js',
      `module.exports = {\n  extends: [require.resolve('doohickey/standard/stylelint')],\n};`
    )
    modules.push('stylelint')
  }

  if (args.l || args.lintstaged || defaultAction) {
    await configExists('lint-staged')
    let extend = {
      scripts: {
        'lint-staged': 'lint-staged'
      }
    }
    if (modules.includes('eslint')) {
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

    if (modules.includes('stylelint')) {
      extend['lint-staged'] = {
        '**/*.less': 'stylelint --syntax less',
        ...(extend['lint-staged'] ?? {})
      }
    }

    if (modules.includes('prettier')) {
      extend['lint-staged'] = {
        '**/*.{js,jsx,tsx,ts,less,md,json}': ['prettier --write'],
        ...(extend['lint-staged'] ?? {})
      }
    }

    await extendPackage(extend)
    modules.push('lint-staged')
  }

  try {
    if (args.k || args.husky || defaultAction) {
      await runCmd('npm install husky --save-dev')
      await extendPackage({
        scripts: {
          prepare: 'husky install'
        }
      })

      await runCmd('npm run prepare')
      await runCmd('npx husky add .husky/commit-msg "npx --no-install doohickey verifyCommitMsg"')
      await runCmd('npx husky add .husky/pre-commit "npx --no-install lint-staged"')
      modules.push('husky')
    }

    if (modules.length > 0) {
      modules = modules.filter((item) => item !== 'husky')

      if (modules.length > 0) {
        await runCmd(`npm install ${modules.join(' ')} --save-dev`)
      }

      console.log('')
      console.log(`  ${chalk.green('successfully')} \n`)
    } else {
      console.log(`Option does not exist\nSee 'doohickey init --help'`)
    }
  } catch (err) {
    console.error(`${chalk.bgRed.white(' ERROR ')} ${chalk.red(err)} `)
    spinner.stop()
  }
}

// TODO: 修改
const configExists = async (moduleName, cosmiconfigOpt = {}) => {
  const explorer = cosmiconfig(moduleName, cosmiconfigOpt)
  try {
    const fileInfo = await explorer.search()

    Promise.resolve()
    if (!fileInfo) {
      console.log(
        `${chalk.white.bgGreen(` ${moduleName} `)}: ${chalk.green(
          `configuration is created successfully`
        )}`
      )
    } else {
      console.log(
        ` ${chalk.bgRed.white(` ${fileInfo.config} `)}: ${chalk.red(
          `configuration has exists in ${fileInfo.filepath} !`
        )}`
      )
    }
  } catch (err) {
    console.error(`${chalk.bgRed.white(' ERROR ')} ${chalk.red(err)} `)
    return Promise.reject()
  }
}

const extendPackage = async (fields) => {
  const pkg = require(`${process.cwd()}/package.json`)
  const toMerge = fields

  for (const key in toMerge) {
    const value = toMerge[key]
    const existing = pkg[key]

    if (existing) {
      pkg[key] = Object.assign(existing, value)
    } else {
      pkg[key] = value
    }
  }
  return writeFile(require.resolve(`${process.cwd()}/package.json`), JSON.stringify(pkg, null, 2))
}

const runCmd = (cmd) => {
  spinner.start(` ${chalk.white.bgGreen(' executing ')} ${cmd}`)

  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
      spinner.stop()
    })
  })
}
