import { readFileSync } from 'fs'
import { cosmiconfig } from 'cosmiconfig'
import verifyCommitMsg from '../cli/verify-commit-msg'

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))
jest.mock('cosmiconfig', () => ({
  cosmiconfig: jest.fn(),
}))

jest.spyOn(global.console, 'log')
jest.spyOn(global.console, 'error')
const exitSpy = jest.spyOn(process, 'exit').mockImplementation((number) => { throw new Error('process.exit: ' + number) })

describe('verify-commit-msg test', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('verifyCommitMsg return null with msg pass the regExp', async () => {
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(null)
      },
    })

    ;(readFileSync as jest.Mock).mockReturnValue('feat: new feature')
    await verifyCommitMsg('')

    ;(readFileSync as jest.Mock).mockReturnValue('v1.0.0')
    await verifyCommitMsg('')

    ;(readFileSync as jest.Mock).mockReturnValue('feat(any character): new feature')
    await verifyCommitMsg('')

    expect(console.log).toHaveBeenCalledTimes(0)
    expect(console.error).toHaveBeenCalledTimes(0)
    expect(verifyCommitMsg('')).toBeNull
  })

  test('verifyCommitMsg print error with msg failed pass the regExp', async () => {
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve(null)
      },
    })

    ;(readFileSync as jest.Mock).mockReturnValue('hello: new feature')

    try {
      await verifyCommitMsg('')
      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.error).toHaveBeenCalledTimes(1)
    } catch (err) {
      expect(exitSpy).toThrow()
      expect(err).toEqual(new Error('process.exit: 1'))
    }
  })

  test('verifyCommitMsg print error with incorrect type in config (gitCommitMsg.scopes)', async () => {
    ;(cosmiconfig as jest.Mock).mockReturnValueOnce({
      search: () => {
        return Promise.resolve({
          config: {
            gitCommitMsg: {
              scopes: 'hello',
            },
          },
        })
      },
    })

    try {
      await verifyCommitMsg('')
      expect(console.log).toHaveBeenCalledTimes(0)
      expect(console.error).toHaveBeenCalledTimes(1)
    } catch (err) {
      expect(exitSpy).toThrow()
      expect(err).toEqual(new Error('process.exit: 1'))
    }
  })

  test('verifyCommitMsg print error with incorrect type in config (gitCommitMsg.subjectLength)', async () => {
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve({
          config: {
            gitCommitMsg: {
              scopes: ['hello'],
              subjectLength: '10'
            },
          },
        })
      },
    })

    try {
      await verifyCommitMsg('')
      expect(console.log).toHaveBeenCalledTimes(0)
      expect(console.error).toHaveBeenCalledTimes(1)
    } catch (err) {
      expect(exitSpy).toThrow()
      expect(err).toEqual(new Error('process.exit: 1'))
    }
  })

  test('verifyCommitMsg return null with correct type in config', async () => {
    ;(cosmiconfig as jest.Mock).mockReturnValue({
      search: () => {
        return Promise.resolve({
          config: {
            gitCommitMsg: {
              scopes: ['scope1', 'scope2'],
              subjectLength: 20
            },
          },
        })
      },
    })

    ;(readFileSync as jest.Mock).mockReturnValue('v1.0.0-alpha')
    await verifyCommitMsg('')

    ;(readFileSync as jest.Mock).mockReturnValue('feat(scope1): new feature')
    await verifyCommitMsg('')

    ;(readFileSync as jest.Mock).mockReturnValue('feat(scope2): new feature')
    await verifyCommitMsg('')

    expect(console.log).toHaveBeenCalledTimes(0)
    expect(console.error).toHaveBeenCalledTimes(0)
    expect(verifyCommitMsg('')).toBeNull
  })
})
