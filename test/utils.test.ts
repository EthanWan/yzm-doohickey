import { spawn } from 'child_process'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import {
  format,
  extendPackage,
  logger,
  readJson,
  isYarnUsed,
  runSpawn as run,
  getNodePkgManagerCommand as getNPMCommand,
} from '../cli/util'

jest.mock('child_process')
jest.mock('fs')
jest.mock('fs/promises')

// @ts-ignore
const { __clearMockFiles, __setMockFiles } = fs
// @ts-ignore
const { writeFile, readFile, __clearMockFilesp, __setMockFilesp } = fsp

describe('util test', () => {
  afterEach(() => {
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

  // test('logger.info have be called with corrent args', () => {
  //   jest.spyOn(global.console, 'log')
  //   jest.mock<{ bgBlue: { white: jest.Mock } }>('chalk', () => ({
  //     bgBlue: {
  //       white: jest.fn().mockReturnValueOnce('test-white'),
  //     },
  //   }))
  //   logger.info('hello', 'info')

  //   expect(chalk.bgBlue.white).toHaveBeenCalledWith(' INFO ')
  //   expect(global.console.log).toHaveBeenCalledWith('test-white hello')
  // })

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
    await expect(readJson('package.json')).rejects
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
      'yarn.json': '',
    })
    expect(isYarnUsed()).toBe(false)
  })

  const npmCmd = process.platform !== 'win32' ? 'npm' : 'npm.cmd'
  const yarnCmd = process.platform !== 'win32' ? 'yarn' : 'yarn.cmd'

  test('getNodePkgManagerCommand returns npm by default', () => {
    expect(getNPMCommand()).toBe(npmCmd)
    expect(getNPMCommand()).toBe(getNPMCommand(false))
  })

  test('getNodePkgManagerCommand returns yarn', () => {
    expect(getNPMCommand(true)).toBe(yarnCmd)
  })
})
