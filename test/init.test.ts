import * as fsp from 'fs/promises'
import yargsParser = require('yargs-parser')
import init from '../cli/init'

jest.mock('child_process')
jest.mock('fs')
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
    args['e'] = args['p'] = args['s'] = args['l'] = args['k'] = true
    await init(args)
    expect(__getMockFilesp()).toBe({
      '.': [''],
    })
  })
})
