import { spawn } from 'child_process'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import {
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

  // test('xxx', () => {
  //   type a = {
  //     format: (label: string, msg: string) => string
  //   }
  //   const util = jest.genMockFromModule<a>('../cli/util')
  //   ;(util.format = (label: string, msg: string) => {
  //     return label + msg
  //   }),
  //     expect(logger.warn('hello')).toBeUndefined
  //   expect(util.format).toReturn
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
    // expect(console.warn).

    jest.spyOn(global.console, 'error')
    logger.error('')
    expect(console.error).toBeCalled()
    expect(console.error).toBeCalledTimes(1)
  })

  test('readJson returns rejects if file is not exist', async () => {
    await expect(readJson('package.json')).rejects.toStrictEqual(
      new Error('file is not exist')
    )
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
      })
    ).resolves.toBe(`{
  "scripts": {
    "dev": "node index.js",
    "build": "node index.js"
  }
}`)

    expect(writeFile).toHaveBeenCalled()
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  test('runSpawn returns rejects by incorrect command', async () => {
    ;(spawn as jest.Mock).mockReturnValue({
      on: (_, cb) => {
        cb(1)
      },
    })

    await expect(run('npm', ['add'])).rejects.toStrictEqual(new Error('Something Wrong!'))
  })

  test('runSpawn returns resolves by correct command', async () => {
    ;(spawn as jest.Mock).mockReturnValue({
      on: (_, cb) => {
        cb(0)
      },
    })

    await expect(run('npm', ['install'])).resolves.toBe(undefined)
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
