import { spawn } from 'child_process'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import {
  extendPackage,
  // logger,
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

    expect(readFile).toHaveBeenCalled()
    expect(readFile).toHaveBeenCalledTimes(1)

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
      'yarn.json': '',
      'package-lock.json': '',
    })
    expect(isYarnUsed()).toBe(false)
  })

  const npmCmd = process.platform !== 'win32' ? 'npm' : 'npm.cmd'
  const yarnCmd = process.platform !== 'win32' ? 'yarn' : 'yarn.cmd'

  test('getNodePkgManagerCommand returns npm by default', () => {
    expect(getNPMCommand()).toBe(npmCmd)
    expect(getNPMCommand()).toBe(getNPMCommand(false))
  })

  test('getPkgManagerCommand returns yarn', () => {
    expect(getNPMCommand(true)).toBe(yarnCmd)
  })
})
