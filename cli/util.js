import chalk from 'chalk'
const stripAnsi = require('strip-ansi')

const format = (label, msg) => {
  return msg
    .split('\n')
    .map((line, i) => {
      return i === 0 ? `${label} ${line}` : line.padStart(stripAnsi(label).length + line.length + 1)
    })
    .join('\n')
}
const chalkTag = (msg) => chalk.bgBlackBright.white.dim(` ${msg} `)

export let logger = {
  log,
  info,
  done,
  process,
  error
}

function log(msg = '', tag = null) {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg)
}

function info(msg, title = null) {
  console.log(format(chalk.bgBlue.black(title ?? ' INFO ') + '', msg))
}

function done(msg, title = null) {
  console.log(format(chalk.bgGreen.black(title ?? ' DONE ') + '', msg))
}

function process(msg, title = null) {
  // 添加loading
  console.log(format(chalk.bgYellow.black(title ?? ' PROCESS ') + '', chalk.yellow(msg)))
}

function error(msg, title = null) {
  // stopSpinner()
  console.error(format(chalk.bgRed.white(title ?? ' ERROR ') + '', chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

export function isYarnUsed(existsSync /*= fs.existsSync*/) {
  if (existsSync('package-lock.json')) {
    return false
  }
  return existsSync('yarn.lock')
}

export function getPkgManagerCommand(isYarnUsed) {
  return (isYarnUsed ? 'yarn' : 'npm') + (process.platform === 'win32' ? '.cmd' : '')
}
