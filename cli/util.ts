import { writeFile as write, readFile as read } from 'fs/promises'
import { existsSync } from 'fs'
import { spawn } from 'child_process'
import chalk = require('chalk')
import stripAnsi from 'strip-ansi'
import { PackageJson } from '@npm/types'

export type LoggerFunction = (msg: string, title?: string | null) => void

export interface Logger {
  log: LoggerFunction
  info: LoggerFunction
  done: LoggerFunction
  warn: LoggerFunction
  error: LoggerFunction
}

interface LintstagedPkgConfig {
  'lint-staged': { [key: string]: string }
}

export type PackageJsonWithLintstaged = LintstagedPkgConfig & PackageJson

// ====== Logger Start ====== //

export const format = (label: string, msg: string) => {
  return msg
    .split('\n')
    .map((line, i) => {
      return i === 0
        ? `${label} ${line}`
        : line.padStart(stripAnsi(label).length + line.length + 1)
    })
    .join('\n')
}
const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `)

function log(msg = '', title) {
  title ? console.log(format(chalkTag(title), msg)) : console.log(msg)
}

function info(msg, title) {
  console.log(
    format(chalk.bgBlue.white(title ? ` ${title.toUpperCase()} ` : ' INFO ') + '', msg)
  )
}

function done(msg, title) {
  console.log(
    format(
      chalk.bgGreen.black(title ? ` ${title.toUpperCase()} ` : ' DONE ') + '',
      chalk.green(msg)
    )
  )
}

function warn(msg, title) {
  console.warn(
    format(
      chalk.bgYellow.black(title ? ` ${title.toUpperCase()} ` : ' WARN ') + '',
      chalk.yellow(msg)
    )
  )
}

function error(msg, title) {
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

export const logger: Logger = {
  log,
  info,
  done,
  warn,
  error,
}

// ====== Logger End ====== //

export function isYarnUsed() {
  if (existsSync('package-lock.json')) {
    return false
  }
  return existsSync('yarn.lock')
}

export function getNodePkgManagerCommand(yarn: boolean = isYarnUsed()): string {
  return (yarn ? 'yarn' : 'npm') + (process.platform === 'win32' ? '.cmd' : '')
}

export async function readJson(jsonPath: string): Promise<string> {
  const contents = await read(jsonPath, { encoding: 'utf8' })
  return JSON.parse(contents)
}

export async function extendPackage(
  fields: Partial<PackageJsonWithLintstaged>
): Promise<void> {
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

export async function runSpawn(
  cmd: string,
  args: ReadonlyArray<string>,
  silence = false
): Promise<void> {
  if (!silence) {
    logger.warn(`${cmd} ${args.join(' ')}`, 'EXECTING')
  }

  return new Promise(resolve => {
    const child = spawn(cmd, args, { stdio: 'inherit' })

    child.on('close', function (code) {
      if (code === 0) {
        resolve()
      }
    })
  })
}
