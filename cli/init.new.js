const { copyFile, writeFile, access } = require('fs/promises')
const path = require('path')
const { cosmiconfig } = require('cosmiconfig')
const chalk = require('chalk')
const modules = require('./utils/constants')
const { extendPackage, run } = require('./util')

module.exports = async function init(args) {
  // default
  const all = Object.keys(args).length === 1

  console.log('')
  const screened = modules.filter((module) => args[module.name[0]] || args[module.name] || all)
  let moduleNames = modules.map((module) => module.name)

  try {
    await Promise.all(
      screened.map((module) => {
        if (module.target === modules.PACKAGE_JSON) {
          return extendPackage(module.cfgConten())
        } else {
          return generateConfig(module.name, module.target, module.cfgConten, module.cosmiconfigOpt)
        }
      })
    )

    if (args.k || args.husky || all) {
      await run('npm install husky --save-dev')
      await extendPackage({
        scripts: {
          prepare: 'husky install'
        }
      })

      await run('npm run prepare')
      await run('npx husky add .husky/commit-msg "npx --no-install doohickey verifyCommitMsg"')
      // 需要判断是否有lint-staged
      await run('npx husky add .husky/pre-commit "npx --no-install lint-staged"')
    }

    if (moduleNames.length > 0) {
      await run(`npm install ${modules.join(' ')} --save-dev`)

      console.log('')
      console.log(`  ${chalk.green('successfully')} \n`)
    } else {
      console.log(`Option does not exist\nSee 'doohickey init --help'`)
    }
  } catch (err) {
    console.error(`${chalk.bgRed.white(' ERROR ')} ${chalk.red(err)} `)
  }
}

const generateConfig = async (moduleName, fileName, configStr, cosmiconfigOpt) => {
  if (moduleName === 'prettier') {
    access('.edtorconfig').catch((_) => {
      copyFile(path.resolve(__dirname, '../.editorconfig'), `.editorconfig`)
    })
  }

  const exist = await configExists(moduleName, cosmiconfigOpt)
  if (exist) {
    return writeFile(fileName, configStr)
  }
}

const configExists = async (moduleName, cosmiconfigOpt = {}) => {
  const explorer = cosmiconfig(moduleName, cosmiconfigOpt)
  try {
    const fileInfo = await explorer.search()

    if (!fileInfo) return Promise.resolve(true)
    console.log(
      ` ${chalk.bgRed.white(` ${fileInfo.config} `)}: ${chalk.red(
        `configuration has exists in ${fileInfo.filepath} !`
      )}`
    )

    return Promise.resolve(false)
  } catch (err) {
    console.error(`${chalk.bgRed.white(' ERROR ')} ${chalk.red(err)} `)
    process.exit(1)
  }
}
