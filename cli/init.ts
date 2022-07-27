import { writeFile as write, readFile as read, access } from 'fs/promises'
import { cosmiconfig } from 'cosmiconfig'
import type { Options } from 'cosmiconfig'
import yargsParser = require('yargs-parser')
import type { PackageJsonWithLintstaged } from './util'
import {
  extendPackage,
  logger,
  isYarnUsed,
  runSpawn as run,
  getNodePkgManagerCommand as getNPMCommand,
} from './util'

export type ModuleName = 'eslint' | 'prettier' | 'stylelint' | 'lint-staged' | 'husky'

const modules: Array<ModuleName> = ['eslint', 'prettier', 'stylelint', 'lint-staged']

async function generateConfigFile(
  modulename: ModuleName,
  filename: string,
  contents: string
): Promise<void> {
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
            '.prettierrc.toml',
          ],
          loaders: {
            '.toml': () => 'toml',
            '.json5': () => 'json5',
          },
        }
      : undefined
  )
  if (!existing) {
    logger.log(`Writing ${filename}...`)
    await write(filename, contents)
    logger.info('Configuration is created successfully', modulename)
  }
}

async function configExists(
  modulename: ModuleName,
  cosmiconfigOpt?: Options
): Promise<boolean> {
  const explorer = cosmiconfig(modulename, cosmiconfigOpt)

  const file = await explorer.search().catch(err => {
    return Promise.reject(err)
  })

  if (!file) return Promise.resolve(false)
  logger.log('')
  logger.warn(`${modulename}: Configuration already exists in ${file.filepath} !`)

  return Promise.resolve(true)
}

async function generateESLintConfig(module: ModuleName): Promise<void> {
  const config = `module.exports = {
  extends: [require.resolve('yzm-doohickey/standard/eslint')]
}`
  return generateConfigFile(module, '.eslintrc.js', config)
}

async function generatePrettierConfig(module: ModuleName): Promise<void> {
  const style = `module.exports = {
  ...require('yzm-doohickey/standard/prettier')
}`
  return generateConfigFile(module, './.prettierrc.js', style)
}

async function generateEditorConfig(): Promise<void> {
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
  const filename = '.editorconfig'
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
  logger.log(`Writing ${filename}`)
  await write(filename, config)
  logger.info('Configuration is created successfully', 'editorconfig')
}

async function generateStyleLintConfig(module: ModuleName) {
  const config = `module.exports = {
  extends: [require.resolve('yzm-doohickey/standard/stylelint')]
}`

  return generateConfigFile(module, './.stylelintrc.js', config)
}

async function extendLintStagedPackage(modules: Array<ModuleName>) {
  const existing = await configExists('lint-staged')
  if (existing) {
    return
  }

  let extension: Partial<PackageJsonWithLintstaged> = {
    scripts: {
      'lint-staged': 'lint-staged',
    },
  }
  if (modules.includes('eslint')) {
    extension = {
      scripts: {
        'lint-staged:js': 'eslint --ext .js,.jsx,.ts,.tsx ',
        ...extension.scripts,
      },
      'lint-staged': {
        '**/*.{js,jsx,ts,tsx}': 'npm run lint-staged:js',
      },
    }
  }

  // Defalut syntax less
  if (modules.includes('stylelint')) {
    extension['lint-staged'] = {
      '**/*.less': 'stylelint --syntax less',
      ...(extension['lint-staged'] ?? {}),
    }
  }

  if (modules.includes('prettier')) {
    extension['lint-staged'] = {
      '**/*.{js,jsx,tsx,ts,less,md,json}': 'prettier --write',
      ...(extension['lint-staged'] ?? {}),
    }
  }

  return extendPackage(extension)
}

async function initHusky(modules) {
  try {
    await access('./.husky')
    logger.log('')
    logger.warn(`husky: Configuration already existing !`)
    return
  } catch (err) {
    if (err.code === 'ENOENT') {
      /* not found file, create it. */
    } else {
      throw new Error(`Unknown error reading .husky: ${err.message}`)
    }
  }

  logger.log('')
  await run(getNPMCommand(), [isYarnUsed ? 'add' : 'install', 'husky', '--save-dev'])
  await extendPackage({
    scripts: {
      prepare: 'husky install',
    },
  })

  await run(getNPMCommand(), ['run', 'prepare'])
  await run('npx', [
    'husky',
    'add',
    '.husky/commit-msg',
    `"npx --no-install doohickey verifyCommitMsg"`,
  ])

  if (modules.includes('lint-staged')) {
    await run('npx', [
      'husky',
      'add',
      '.husky/pre-commit',
      `"npx --no-install lint-staged"`,
    ])
  }
}

async function deal(module: ModuleName, modules: Array<ModuleName>): Promise<void> {
  switch (module) {
    case 'eslint':
      await generateESLintConfig(module)
      break
    case 'prettier':
      await generateEditorConfig()
      await generatePrettierConfig(module)
      break
    case 'stylelint':
      await generateStyleLintConfig(module)
      break
    case 'lint-staged':
      await extendLintStagedPackage(modules)
      break
    default:
  }
}

export default async function init(args: yargsParser.Arguments) {
  // Check if is a npm project
  try {
    await access('./package.json')
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error(`Unable to find package.json file: ${err.message}`)
    }
    logger.log('Please run from a directory with your package.json.')
    return
  }

  // default
  const all = Object.keys(args).length === 1
  logger.log('')

  const toDeal = modules.filter(module => args[module[0]] || args[module] || all)
  try {
    await Promise.all(toDeal.map(module => deal(module, toDeal)))

    if (args.k || args.husky || all) {
      await initHusky(toDeal)
      toDeal.push('husky')
    }

    if (toDeal.length > 0) {
      const flags = ['--ignore-scripts']
      if (!isYarnUsed()) {
        flags.unshift('install')
      }
      await run(getNPMCommand(), flags)

      logger.log('')
      logger.log(` ${logger.done('successfully')}`)
    } else {
      logger.log(
        `Option does not exist
See 'doohickey init --help'`
      )
    }
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}
