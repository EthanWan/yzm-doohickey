import { writeFile as write, readFile as read } from 'fs/promises'
import { exec } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import stripAnsi from 'strip-ansi'

const spinner = ora()

// ====== Logger Start ====== //

const format = (label, msg) => {
  return msg
    .split('\n')
    .map((line, i) => {
      return i === 0 ? `${label} ${line}` : line.padStart(stripAnsi(label).length + line.length + 1)
    })
    .join('\n')
}
const chalkTag = (msg) => chalk.bgBlackBright.white.dim(` ${msg} `)

function log(msg = '', tag = null) {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg)
}

function info(msg, title = null) {
  console.log(format(chalk.bgBlue.white(title ? ` ${title.toUpperCase()} ` : ' INFO ') + '', msg))
}

function done(msg, title = null) {
  console.log(format(chalk.bgGreen.black(title ? ` ${title.toUpperCase()} ` : ' DONE ') + '', chalk.green(msg)))
}

function process(msg, title = null) {
  console.log(format(chalk.bgYellow.black(title ? ` ${title.toUpperCase()} ` : ' PROCESS ') + '', chalk.yellow(msg)))
}

function error(msg, title = null) {
  spinner.stop()
  console.error(format(chalk.bgRed.white(title ? ` ${title.toUpperCase()} ` :' ERROR ') + '', chalk.red(msg)))
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

export let logger = {
  log,
  info,
  done,
  process,
  error
}

// ====== Logger End ====== //

export function isYarnUsed(existsSync /*= fs.existsSync*/) {
  if (existsSync('package-lock.json')) {
    return false
  }
  return existsSync('yarn.lock')
}

export function getPkgManagerCommand(isYarnUsed) {
  return (isYarnUsed ? 'yarn' : 'npm') + (process.platform === 'win32' ? '.cmd' : '')
}

export async function readJson(jsonPath) {
  const contents = await read(jsonPath, {encoding: 'utf8'});
  return JSON.parse(contents);
}

export async function extendPackage(fields) {
  const pkg = await readJson('./package.json')
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
  return write('./package.json', JSON.stringify(pkg, null, 2))
}

export async function run(cmd) {
  spinner.start(format(chalk.bgYellow.black(' EXECTING ') + '', chalk.yellow(cmd)))

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
