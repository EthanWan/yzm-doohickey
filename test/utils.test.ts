import { spawn } from 'child_process'
// @ts-ignore
import { __setMockFiles, __clearMockFiles } from 'fs'
import {
  // extendPackage,
  // logger,
  isYarnUsed,
  runSpawn as run,
  getNodePkgManagerCommand as getNPMCommand,
} from '../cli/util'

jest.mock('child_process')
jest.mock('fs')

describe('util test', () => {
  afterEach(() => {
    __clearMockFiles()
  })

  test('run returns rejects by incorrect command', async () => {
    ;(spawn as jest.Mock).mockReturnValue({
      on: (_, cb) => {
        cb(1)
      },
    })

    await expect(run('npm', ['add'])).rejects.toStrictEqual(new Error('Something Wrong!'))
  })

  test('run returns resolves by correct command', async () => {
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
