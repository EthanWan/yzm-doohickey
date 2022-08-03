import { readFileSync } from 'fs'
import verifyCommitMsg from '../cli/verify-commit-msg'

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))

jest.spyOn(global.console, 'log')
jest.spyOn(global.console, 'error')

describe('verify-commit-msg test', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('verifyCommitMsg return null with msg pass the regExp', () => {
    ;(readFileSync as jest.Mock).mockReturnValue('feat: new feature')

    verifyCommitMsg('')
    expect(console.log).toHaveBeenCalledTimes(0)
    expect(console.error).toHaveBeenCalledTimes(0)
    expect(readFileSync).toReturnWith('feat: new feature')
    expect(verifyCommitMsg('')).toBeNull
  })

  test('verifyCommitMsg print error with msg failed pass the regExp', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation()
    ;(readFileSync as jest.Mock).mockReturnValue('hello: new feature')

    verifyCommitMsg('')
    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(exitSpy).toHaveBeenCalledTimes(1)
    expect(readFileSync).toReturnWith('hello: new feature')
  })
})
