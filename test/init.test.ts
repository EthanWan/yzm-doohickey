import * as fsp from 'fs/promises'
import yargsParser = require('yargs-parser')
import { cosmiconfig } from 'cosmiconfig'
import init from '../cli/init'
import { runSpawn, logger } from '../cli/util'

jest.mock('cosmiconfig', () => ({
  cosmiconfig: jest.fn(),
}))

jest.mock('../cli/util', () => ({
  runSpawn: jest.fn(),
}))

jest.mock('fs/promises')

// @ts-ignore
const { access, __clearMockFilesp, __setMockFilesp, __getMockFilesp } = fsp

const args: yargsParser.Arguments = { _: [] }

describe('init test', () => {
  afterEach(() => {
    __clearMockFilesp()

    jest.restoreAllMocks()
  })

  test('init results rejects if package.json is not exist', async () => {
    expect(init(args)).rejects
  })

  test('init results logger.log if option does not exist', async () => {
    __setMockFilesp({
      'package.json': '',
    })
    await expect(
      init({
        ...args,
        c: true,
      })
    ).toBeNull
    expect(access).toHaveBeenCalled()
  })

  test('init 2', async () => {
    __setMockFilesp({
      'package.json': '{}',
      '.editorconfig': '',
    })
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(undefined)
      },
    })
    ;(runSpawn as jest.Mock).mockResolvedValue(true)

    jest.spyOn(logger, 'log')

    args['e'] = args['p'] = args['s'] = args['l'] = args['k'] = true
    await init(args)
    expect(cosmiconfig).toHaveBeenCalled()
    expect(runSpawn).toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalled()

    expect(__getMockFilesp()).toBe({
      '.': [''],
    })
  })
})
