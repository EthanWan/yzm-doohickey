import { spawn } from 'child_process'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import * as fg from 'fast-glob'
import {
  format,
  extendPackage,
  logger,
  readJson,
  isYarnUsed,
  isPnpmUsed,
  runSpawn as run,
  getNodePkgManagerCommand as getNPMCommand,
  mainExtension,
} from '../cli/util'

jest.mock('child_process')
jest.mock('fs')
jest.mock('fast-glob')
jest.mock('fs/promises')

// @ts-ignore
const { __clearMockFiles, __setMockFiles, stat } = fs
// @ts-ignore
const { writeFile, readFile, __clearMockFilesp, __setMockFilesp } = fsp

describe('util test', () => {
  afterEach(() => {
    // @ts-ignore
    ;(stat as jest.Mock).mockClear()
    __clearMockFiles()
    __clearMockFilesp()

    jest.restoreAllMocks()
  })

  test('format returns string with "\\n"', () => {
    expect(format('INFO', 'hello\nevery body\nenjoy your life')).toBe(`INFO hello
     every body
     enjoy your life`)
  })

  test('format returns string without "\\n"', () => {
    expect(format('hello', 'world')).toBe('hello world')
  })

  test('logger to be called ', () => {
    jest.spyOn(global.console, 'log')
    logger.log('')
    logger.info('')
    logger.done('')
    expect(console.log).toBeCalled()
    expect(console.log).toBeCalledTimes(3)

    jest.spyOn(global.console, 'warn')
    logger.warn('')
    expect(console.warn).toBeCalled()
    expect(console.warn).toBeCalledTimes(1)

    jest.spyOn(global.console, 'error')
    logger.error('')
    expect(console.error).toBeCalled()
    expect(console.error).toBeCalledTimes(1)
  })

  test('readJson returns rejects if file is not exist', async () => {
    await expect(readJson('package.json')).rejects.toEqual({ name: 'error', code: 'ENOENT', message: 'file is not exist' })
    expect(readFile).toHaveBeenCalled()
    expect(readFile).toHaveBeenCalledTimes(1)
  })

  test('extendPackage returns resolve if content is right', async () => {
    __setMockFilesp({
      'package.json': '{"scripts":{"dev":"node index.js"}}',
    })

    await expect(
      extendPackage({
        scripts: {
          build: 'node index.js',
        },
        dependencies: {
          react: '18.0.0',
        },
      })
    ).resolves.toBe(`{
  "scripts": {
    "dev": "node index.js",
    "build": "node index.js"
  },
  "dependencies": {
    "react": "18.0.0"
  }
}`)

    expect(writeFile).toHaveBeenCalled()
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  test('runSpawn returns null by incorrect command', async () => {
    ;(spawn as jest.Mock).mockReturnValue({
      on: (_, cb) => {
        cb(1)
      },
    })

    await expect(run('npm', ['add'])).toBeNull
  })

  test('runSpawn returns resolves by correct command', async () => {
    ;(spawn as jest.Mock).mockReturnValue({
      on: (_, cb) => {
        cb(0)
      },
    })

    await expect(run('npm', ['install'])).resolves.toBe(undefined)
  })

  test('runSpawn do not print log by send silence true', async () => {
    ;(spawn as jest.Mock).mockReturnValue({
      on: (_, cb) => {
        cb(0)
      },
    })
    jest.spyOn(global.console, 'warn')

    await run('npm', ['install'], true)
    expect(console.warn).toHaveBeenCalledTimes(0)
  })

  test("isYarnUsed returns true if there's yarn.lock file only", () => {
    __setMockFiles({
      'yarn.lock': '',
    })
    expect(isYarnUsed()).toBe(true)
  })

  test("isYarnUsed returns false if there's package-lock.json file only", () => {
    __setMockFiles({
      'package-lock.json': '',
    })
    expect(isYarnUsed()).toBe(false)
  })

  test("isYarnUsed returns false if there're yarn.lock and package-lock.json files", () => {
    __setMockFiles({
      'package-lock.json': '',
      'yarn.lock': '',
    })
    expect(isYarnUsed()).toBe(false)
  })

  test("isPnpmUsed returns true if there's pnpm-lock.yaml file only", () => {
    __setMockFiles({
      'pnpm-lock.yaml': '',
    })
    expect(isPnpmUsed()).toBe(true)
  })

  test("isPnpmUsed returns false if there's package-lock.json file only", () => {
    __setMockFiles({
      'package-lock.json': '',
    })
    expect(isPnpmUsed()).toBe(false)
  })

  test("isPnpmUsed returns false if there're yarn.lock and package-lock.json files", () => {
    __setMockFiles({
      'package-lock.json': '',
      'pnpm-lock.yaml': '',
    })
    expect(isPnpmUsed()).toBe(false)
  })

  const npmCmd = process.platform !== 'win32' ? 'npm' : 'npm.cmd'
  const yarnCmd = process.platform !== 'win32' ? 'yarn' : 'yarn.cmd'
  const pnpmCmd = process.platform !== 'win32' ? 'pnpm' : 'pnpm.cmd'

  test('getNodePkgManagerCommand returns npm by default', () => {
    expect(getNPMCommand()).toBe(npmCmd)
    expect(getNPMCommand()).toBe(getNPMCommand())
  })

  test('getNodePkgManagerCommand returns pnpm', () => {
    __setMockFiles({
      'pnpm-lock.yaml': '',
    })
    expect(getNPMCommand()).toBe(pnpmCmd)
  })

  test('getNodePkgManagerCommand returns yarn', () => {
    __setMockFiles({
      'yarn.lock': '',
    })
    expect(getNPMCommand()).toBe(yarnCmd)
  })

  test('mainExtension returns main files extension with src enter', async () => {
    __setMockFiles({
      './src/index.js': '',
    })
    // @ts-ignore
    ;(fg as jest.Mock)
      .mockResolvedValueOnce(Array(1).fill(0))
      .mockResolvedValueOnce(Array(2).fill(0))

    const res = await mainExtension(['js', 'ts'], '.')
    expect(stat).toBeCalledTimes(1)

    expect(res).toBe('ts')
  })

  test('mainExtension returns main files extension with pages enter', async () => {
    __setMockFiles({
      './pages/index.js': '',
    })
    // @ts-ignore
    ;(fg as jest.Mock)
      .mockResolvedValueOnce(Array(2).fill(0))
      .mockResolvedValueOnce(Array(1).fill(0))

    const res = await mainExtension(['js', 'ts'], '.')
    expect(stat).toBeCalledTimes(2)

    expect(res).toBe('js')
  })

  test('mainExtension returns main files extension without main enter', async () => {
    // @ts-ignore
    ;(fg as jest.Mock)
      .mockResolvedValueOnce(Array(2).fill(0))
      .mockResolvedValueOnce(Array(1).fill(0))

    const res = await mainExtension(['js', 'ts'], '.')
    expect(stat).toBeCalledTimes(2)

    expect(res).toBe('js')
  })
})
