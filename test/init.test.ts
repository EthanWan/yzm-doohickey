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

const {
  access,
  writeFile,
  readFile,
  // @ts-ignore
  __clearMockFilesp,
  // @ts-ignore
  __setMockFilesp,
  // @ts-ignore
  __addMockFilesp,
  // @ts-ignore
  __getMockFilesp,
} = fsp

let args: yargsParser.Arguments = { _: [] }

const ESLINT = '.eslintrc.js'
const EDITORCONFIG = '.editorconfig'
const STYLELINT = '.stylelintrc.js'
const PRETTIER = '.prettierrc.js'

const fakePackeage = {
  scripts: {
    'lint:js': 'doohickey lint:js --ext .js,.jsx,.ts,.tsx ',
    'lint-staged': 'lint-staged',
    prepare: 'husky install',
  },
  'lint-staged': {
    '**/*.{js,jsx,tsx,ts,less,md,json}': 'doohickey lint:prettier --write',
    '**/*.less': 'doohickey lint:style --syntax less',
    '**/*.{js,jsx,ts,tsx}': 'npm run lint:js',
  },
}

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
    args = { _: [] }
    __setMockFilesp({
      'package.json': '{}',
    })
    ;(readFile as jest.Mock).mockClear()
  })

  afterEach(() => {
    ;(runSpawn as jest.Mock).mockClear()
    ;(writeFile as jest.Mock).mockClear()
    __clearMockFilesp()
  })

  test('init results rejects if package.json dose not exist', async () => {
    __setMockFilesp({})
    expect(init(args)).rejects
  })

  test('init results logger.log if option does not exist', async () => {
    args['c'] = true
    await expect(init(args)).toBeNull
    expect(access).toHaveBeenCalled()
  })

  test('init generate all config file and extend package.json by "doohickey init -e -p -s -l -k" or "doohickey init -epslk"', async () => {
    args['e'] = args['p'] = args['s'] = args['l'] = args['k'] = true
    await init(args)
    expect(cosmiconfig).toHaveBeenCalled()
    expect(runSpawn).toHaveBeenCalled()

    expect(__getMockFilesp()).toEqual(
      setMockFiles({
        'package.json': JSON.stringify(fakePackeage, null, 2),
        ...fakeFiles,
      })
    )
  })

  test('init generate all config file and extend package.json by "doohickey init -eslint --prettier --stylelint --lint-staged --husky"', async () => {
    args['eslint'] =
      args['prettier'] =
      args['stylelint'] =
      args['lint-staged'] =
      args['husky'] =
        true
    await init(args)

    await expect(__getMockFilesp()).toEqual(
      setMockFiles({
        'package.json': JSON.stringify(fakePackeage, null, 2),
        ...fakeFiles,
      })
    )
  })

  test('init generate all config file by "doohickey init"', async () => {
    await init(args)

    expect(__getMockFilesp()).toEqual(
      setMockFiles({
        'package.json': JSON.stringify(fakePackeage, null, 2),
        ...fakeFiles,
      })
    )
  })

  test('init does not generate any files by "doohickey init" if files already existed', async () => {
    __setMockFilesp({
      ...fakeFiles,
      'package.json': JSON.stringify(fakePackeage, null, 2),
    })
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(true)
      },
    })

    await init(args)
    // .editorconfig exist
    expect(readFile).toHaveBeenCalledWith('.editorconfig', 'utf8')
    expect(readFile).toHaveReturnedWith(Promise.resolve(fakeFiles['.editorconfig']))

    // init husky
    expect(writeFile).toHaveBeenCalledTimes(1)
  })

  test('init generate .husky and commit-msg by "doohickey init -k"', async () => {
    args['k'] = true
    await init(args)
    ;(runSpawn as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(
        __setMockFilesp({
          '.husky/commit-msg': '',
        })
      )

    expect(runSpawn).toHaveBeenCalledTimes(4)
    await expect(__getMockFilesp()['.husky'].map(mockfile => mockfile.file)).toEqual([
      'commit-msg',
    ])
  })

  test('init generate .husky commit-msg pre-commit by "doohickey init -k -l"', async () => {
    args['k'] = args['l'] = true
    await init(args)
    ;(runSpawn as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(
        __setMockFilesp({
          '.husky/commit-msg': '',
        })
      )
      .mockResolvedValueOnce(
        __addMockFilesp({
          '.husky/pre-commit': '',
        })
      )

    expect(runSpawn).toHaveBeenCalledTimes(5)
    await expect(__getMockFilesp()['.husky'].map(mockfile => mockfile.file)).toEqual([
      'commit-msg',
      'pre-commit',
    ])
  })

  const expectFinalMockFiles = (modules: string[], packageJson = {}) => {
    const initFiles = {
      'package.json': JSON.stringify(packageJson, null, 2),
    }
    modules.forEach(module => {
      if (fakeFiles[module]) {
        initFiles[module] = fakeFiles[module]
      }
    })
    expect(__getMockFilesp()).toEqual(setMockFiles(initFiles))
  }

  test('init use a single command option for eslint', async () => {
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(undefined)
      },
    })
    await init({
      ...args,
      e: true,
    })
    expectFinalMockFiles([ESLINT])
    await init({
      ...args,
      eslint: true,
    })
    expectFinalMockFiles([ESLINT])
  })

  test('init use a single command option for prettier', async () => {
    await init({
      ...args,
      p: true,
    })
    expectFinalMockFiles([EDITORCONFIG, PRETTIER])
    await init({
      ...args,
      prettier: true,
    })
    expectFinalMockFiles([EDITORCONFIG, PRETTIER])
  })

  test('init use a single command option for stylelint', async () => {
    await init({
      ...args,
      s: true,
    })
    expectFinalMockFiles([STYLELINT])
    await init({
      ...args,
      stylelint: true,
    })
    expectFinalMockFiles([STYLELINT])
  })

  test('init use a single command option for lint-staged', async () => {
    await init({
      ...args,
      l: true,
    })
    expectFinalMockFiles([], {
      scripts: {
        'lint-staged': 'lint-staged',
      },
      'lint-staged': {},
    })
    await init({
      ...args,
      'lint-staged': true,
    })
    expectFinalMockFiles([], {
      scripts: {
        'lint-staged': 'lint-staged',
      },
      'lint-staged': {},
    })
  })

  test('init extend package.json by "doohicky init -el', async () => {
    await init({
      ...args,
      l: true,
      e: true,
    })
    expectFinalMockFiles([ESLINT], {
      scripts: {
        'lint:js': 'doohickey lint:js --ext .js,.jsx,.ts,.tsx ',
        'lint-staged': 'lint-staged',
      },
      'lint-staged': {
        '**/*.{js,jsx,ts,tsx}': 'npm run lint:js',
      },
    })
  })

  test('init extend package.json by "doohicky init -pl"', async () => {
    await init({
      ...args,
      l: true,
      p: true,
    })
    expectFinalMockFiles([EDITORCONFIG, PRETTIER], {
      scripts: {
        'lint-staged': 'lint-staged',
      },
      'lint-staged': {
        '**/*.{js,jsx,tsx,ts,less,md,json}': 'doohickey lint:prettier --write',
      },
    })
  })

  test('init extend package.json by "doohicky init -sl"', async () => {
    await init({
      ...args,
      l: true,
      s: true,
    })
    expectFinalMockFiles([STYLELINT], {
      scripts: {
        'lint-staged': 'lint-staged',
      },
      'lint-staged': {
        '**/*.less': 'doohickey lint:style --syntax less',
      },
    })
  })
})
