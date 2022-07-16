import { PathLike } from 'fs'
import {
  // extendPackage,
  // logger,
  isYarnUsed,
  // runSpawn as run,
  getNodePkgManagerCommand as getNPMCommand,
} from '../cli/util'

function makeFakeFsExistsSync(expected: PathLike[]): (path: PathLike) => boolean {
  return (path: PathLike) => expected.some(item => item === path)
}

describe('util test', () => {
  // test('run returns rejects by npm add', async () => {
  //   await expect(run('npm', ['add'])).rejects.toBe('Something Wrong!')
  // })

  // test('run returns resolves by npm install', async () => {
  //   await expect(run('npm', ['install'])).resolves.toBe('')
  // })

  test("isYarnUsed returns true if there's yarn.lock file only", () => {
    const existsSync = makeFakeFsExistsSync(['yarn.lock'])
    expect(isYarnUsed(existsSync)).toBe(true)
  })

  test("isYarnUsed returns false if there's package-lock.json file only", () => {
    const existsSync = makeFakeFsExistsSync(['package-lock.json'])
    expect(isYarnUsed(existsSync)).toBe(false)
  })

  test("isYarnUsed returns false if there're yarn.lock and package-lock.json files", () => {
    const existsSync = makeFakeFsExistsSync(['package-lock.json', 'yarn.lock'])
    expect(isYarnUsed(existsSync)).toBe(false)
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
