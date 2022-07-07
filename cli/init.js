import { writeFile as write, readFile as read } from 'fs/promises'
import { cosmiconfig } from 'cosmiconfig'
import { extendPackage, run, logger } from './util.js'

let modules = ['eslint', 'prettier', 'styleline', 'lint-staged']

const generateConfigFile = async (modulename, filename, contents) => {
  try {
    const existing = await configExists(
      modulename,
      modulename === 'prettier'
        ? {
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
          }
        : {}
    )

    if (existing) {
      await write(filename, contents)
      logger.log('')
      logger.info('Configuration is created successfully', modulename)
    }
  } catch (err) {
    throw err
  }
}

const configExists = async (moduleName, cosmiconfigOpt = {}) => {
  const explorer = cosmiconfig(moduleName, cosmiconfigOpt)

  const file = await explorer.search().catch((err) => {
    return Promise.reject(err)
  })

  if (!file) return Promise.resolve(true)
  logger.log('')
  logger.info(`Configuration already exists in ${file.filepath} !`, file.config)

  return Promise.resolve(false)
}

async function generateESLintConfig(module) {
  const config = `module.exports = {
    extends: [require.resolve('doohickey/standard/eslint')]
}`
  return generateConfigFile(module, './.eslintrc.js', config)
}

async function generatePrettierConfig(module) {
  const style = `const { prettier } = require('yzm-doohickey')
module.exports = {
  ...prettier
}
`
  return generateConfigFile(module, './.prettierrc.js', style)
}

async function generateEditorConfig(module) {
  const config = `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`
  let existing
  const filename = './.editorconfig'
  try {
    existing = await read(filename, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      /* not found file, create it. */
    } else {
      throw new Error(`Unknown error reading ${filename}: ${err.message}`)
    }
  }
  if (existing && existing === config) {
    logger.log(`No edits needed in ${filename}`)
    return
  }
  await write(filename, config)
  logger.info('Configuration is created successfully', '.editorconfig')
}

async function generateStyleLintConfig(module) {
  const config = `module.exports = {
    extends: [require.resolve('doohickey/standard/stylelint')]
}`

  return generateConfigFile(module, './.stylelintrc.js', config)
}

async function extendLintStagedPackage(modules) {
  let extension = {
    scripts: {
      'lint-staged': 'lint-staged'
    }
  }
  if (modules.includes('eslint')) {
    extension = {
      scripts: {
        'lint-staged:js': 'eslint --ext .js,.jsx,.ts,.tsx ',
        ...extension.scripts
      },
      'lint-staged': {
        '**/*.{js,jsx,ts,tsx}': 'npm run lint-staged:js'
      }
    }
  }

  if (modules.includes('stylelint')) {
    extension['lint-staged'] = {
      '**/*.less': 'stylelint --syntax less',
      ...(extension['lint-staged'] ?? {})
    }
  }

  if (modules.includes('prettier')) {
    extension['lint-staged'] = {
      '**/*.{js,jsx,tsx,ts,less,md,json}': ['prettier --write'],
      ...(extension['lint-staged'] ?? {})
    }
  }

  return extendPackage(extension)
}

async function initHusky(modules) {
  logger.log('')
  await run('npm install husky --save-dev')
  await extendPackage({
    scripts: {
      prepare: 'husky install'
    }
  })

  await run(`npm run prepare`)
  await run(`npx husky add .husky/commit-msg "npx --no-install doohickey verifyCommitMsg"`)
  if (modules.includes('lint-staged')) {
    await run(`npx husky add .husky/pre-commit "npx --no-install lint-staged"`)
  }
}

async function deal(module, modules) {
  switch (module) {
    case 'eslint':
      await generateESLintConfig(module)
      break
    case 'prettier':
      await generateEditorConfig(module)
      await generatePrettierConfig(module)
      break
    case 'styleline':
      await generateStyleLintConfig(module)
      break
    case 'lint-staged':
      await extendLintStagedPackage(modules)
      break
    default:
  }
}

export default async function init(args) {
  // package.json

  // default
  const all = Object.keys(args).length === 1
  logger.log('')

  const toDeal = modules.filter((module) => args[module[0]] || args[module] || all)
  // toInstall
  try {
    await Promise.all(toDeal.map((module) => deal(module, toDeal)))

    if (args.k || args.husky || all) {
      await initHusky(toDeal)
      toDeal.push('husky')
    }

    if (toDeal.length > 0) {
      // once
      // await run(`npm install ${moduleNames.join(' ')} --save-dev`)
      // logger.log('\n')
      logger.log(` ${logger.done('successfully')}`)

    } else {
      logger.log(`Option does not exist
See 'doohickey init --help'`)
    }
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}
