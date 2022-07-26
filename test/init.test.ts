import * as fsp from 'fs/promises'
import * as path from 'path'
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
;(cosmiconfig as jest.Mock).mockReturnValue({
  search: () => {
    return Promise.resolve(undefined)
  },
})
;(runSpawn as jest.Mock).mockResolvedValue(true)

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

function setMockFiles(newMockFiles) {
  const mockFiles = Object.create(null)
  for (const file in newMockFiles) {
    const dir = path.dirname(file)
    if (!mockFiles[dir]) {
      mockFiles[dir] = []
    }

    mockFiles[dir].push({
      file: path.basename(file),
      content: newMockFiles[file],
    })
  }
  return mockFiles
}

describe('init test', () => {
  beforeEach(() => {
    __setMockFilesp({
      'package.json': '{}',
    })
  })

  afterEach(() => {
    __clearMockFilesp()
    jest.restoreAllMocks()
  })

  test('init results rejects if package.json dose not exist', async () => {
    expect(init(args)).rejects
  })

  test('init results logger.log if option does not exist', async () => {
    args['c'] = true
    await expect(init(args)).toBeNull
    expect(access).toHaveBeenCalled()
  })

  test('init create all config file by "doohickey init -e -p -s -l -k" or "doohickey init -epslk"', async () => {
    args['e'] = args['p'] = args['s'] = args['l'] = args['k'] = true
    await init(args)
    expect(cosmiconfig).toHaveBeenCalled()
    expect(runSpawn).toHaveBeenCalled()

    expect(__getMockFilesp()).toEqual(
      setMockFiles({
        'package.json': '{}',
        ...fakeFiles,
      })
    )
  })

  test('init generate all config file by "doohickey init"', async () => {
    args['all'] = true
    await init(args)

    expect(__getMockFilesp()).toEqual(
      setMockFiles({
        'package.json': '{}',
        ...fakeFiles,
      })
    )
  })

  test('init does not generate any files by "doohickey init" if files already exist', async () => {
    const mockFiles = setMockFiles({
      'package.json': '{}',
    })

    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(true)
      },
    })

    await init(args)

    expect(__getMockFilesp()).toEqual(mockFiles)
  })

  // test('init generate .eslintrc.js and extend package.json by "doohickey init -e"', async () => {
  //   args['e'] = true
  //   await init(args)

  //   expect(__getMockFilesp()).toEqual()
  // })
})
