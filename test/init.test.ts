import * as fsp from 'fs/promises'
import yargsParser = require('yargs-parser')
import { cosmiconfig } from 'cosmiconfig'
import init from '../cli/init'
import { runSpawn } from '../cli/util'

jest.mock('cosmiconfig', () => ({
  cosmiconfig: jest.fn(),
}))

jest.mock('../cli/util', () => {
  const originalModule = jest.requireActual('../cli/util')
  return {
    ...originalModule,
    runSpawn: jest.fn(),
    extendPackage: jest.fn(),
    isYarnUsed: jest.fn(),
    getNodePkgManagerCommand: jest.fn(),
  }
})

jest.mock('fs/promises')

// @ts-ignore
const { access, __clearMockFilesp, __setMockFilesp, __getMockFilesp } = fsp

const args: yargsParser.Arguments = { _: [] }

const fakeFiles = {
  '.editorconfig': `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`,
  '.eslintrc.js': `module.exports = {
  extends: [require.resolve('yzm-doohickey/standard/eslint')]
}`,
  '.stylelintrc.js': `module.exports = {
  extends: [require.resolve('yzm-doohickey/standard/stylelint')]
}`,
  '.prettierrc.js': `module.exports = {
  ...require('yzm-doohickey/standard/prettier')
}`,
}

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

  test('init create all config file by "doohickey init -e -p -s -l -k"', async () => {
    __setMockFilesp({
      'package.json': '{}',
    })
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(undefined)
      },
    })
    ;(runSpawn as jest.Mock).mockResolvedValue(true)

    args['e'] = args['p'] = args['s'] = args['l'] = args['k'] = true
    await init(args)
    expect(cosmiconfig).toHaveBeenCalled()
    expect(runSpawn).toHaveBeenCalled()

    const expectValue = Object.keys(fakeFiles).map(key => ({
      file: key,
      content: fakeFiles[key],
    }))
    expect(__getMockFilesp()).toEqual({
      '.': [{ file: 'package.json', content: '{}' }, ...expectValue],
    })
  })
})
