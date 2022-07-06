const { exec } = require('child_process')
const { writeFile } = require('fs/promises')
const chalk = require('chalk')
const ora = require('ora')

const spinner = ora()

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

const run = (cmd) => {
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

module.exports = {
  extendPackage,
  run
}
