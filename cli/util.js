import { writeFile as write, readFile as read } from 'fs/promises'
import { existsSync as exist } from 'fs'
import { spawn } from 'child_process'
import chalk from 'chalk'
import stripAnsi from 'strip-ansi'

// ====== Logger Start ====== //

const format = (label, msg) => {
  return msg
    .split('\n')
    .map((line, i) => {
      return i === 0
        ? `${label} ${line}`
        : line.padStart(stripAnsi(label).length + line.length + 1)
    })
    .join('\n')
}
const chalkTag = (msg) => chalk.bgBlackBright.white.dim(` ${msg} `)

function log(msg = '', tag = null) {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg)
}

function info(msg, title = null) {
  console.log(
    format(
      chalk.bgBlue.white(title ? ` ${title.toUpperCase()} ` : ' INFO ') + '',
      msg
    )
  )
}

function done(msg, title = null) {
  console.log(
    format(
      chalk.bgGreen.black(title ? ` ${title.toUpperCase()} ` : ' DONE ') + '',
      chalk.green(msg)
    )
  )
}

function warn(msg, title = null) {
  console.log(
    format(
      chalk.bgYellow.black(title ? ` ${title.toUpperCase()} ` : ' WARN ') + '',
      chalk.yellow(msg)
    )
  )
}

function error(msg, title = null) {
  console.error(
    format(
      chalk.bgRed.white(title ? ` ${title.toUpperCase()} ` : ' ERROR ') + '',
      chalk.red(msg)
    )
  )
  if (msg instanceof Error) {
    console.error(msg.stack)
  }
}

export let logger = {
  log,
  info,
  done,
  warn,
  error,
}

// ====== Logger End ====== //

function isYarnUsed(existsSync = exist) {
  if (existsSync('package-lock.json')) {
    return false
  }
  return existsSync('yarn.lock')
}

export function getNodePkgManagerCommand(yarn = isYarnUsed()) {
  return (yarn ? 'yarn' : 'npm') + (process.platform === 'win32' ? '.cmd' : '')
}

export async function readJson(jsonPath) {
  const contents = await read(jsonPath, { encoding: 'utf8' })
  return JSON.parse(contents)
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

export async function runSpawn(cmd, args) {
  logger.warn('EXECTING', `${cmd} ${args.join(' ')}`)

  const child = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'inherit'] })

  child.stdout.on('data', function (data) {
    logger.log(data.toString())
  })

  child.on('close', function (code) {
    if (code === 0) {
      return Promise.resolve()
    } else {
      throw new Error('Something Wrong!')
    }
  })
}
