import { writeFile as write, readFile as read } from 'fs/promises'
import { existsSync, stat } from 'fs'
import { PathLike } from 'fs'
import { spawn } from 'child_process'
import * as fg from 'fast-glob'
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

export function isPnpmUsed() {
  if (existsSync('package-lock.json')) {
    return false
  }
  return existsSync('pnpm-lock.yaml')
}

export function getNodePkgManagerCommand(): string {
  const yarn = isYarnUsed()
  const pnpm = isPnpmUsed()
  return (yarn ? 'yarn' : (pnpm ? 'pnpm' : 'npm')) + (process.platform === 'win32' ? '.cmd' : '')
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

const isDirExists = (path: PathLike) => {
  return new Promise(resolve => {
    stat(path, (error, stats) => {
      if (error) return resolve(false)
      return resolve(stats ? stats.isDirectory() : false)
    })
  })
}

export async function mainExtension(
  extension: string[],
  path = process.cwd()
): Promise<string> {
  let sourceEnter = path

  if (await isDirExists(`${path}/src`)) {
    // Common src path
    sourceEnter = `${path}/src`
  } else if (await isDirExists(`${path}/pages`)) {
    // Nextjs main enter
    sourceEnter = `${path}/pages`
  }

  const fileLists = await Promise.all(
    extension.map(item => {
      return fg(`${sourceEnter}/**/*.${item}`, {
        deep: 3,
        ignore: ['**/node_modules/**/'],
      })
    })
  )

  let index = 0
  fileLists.reduce((prev, next, i) => {
    if (prev < next.length) {
      index = i
      return next.length
    }
    return prev
  }, 0)

  return extension[index]
}
