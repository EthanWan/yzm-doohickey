import * as path from 'path'
import { PathLike } from 'fs'
import { OpenMode, PathOrFileDescriptor } from 'node:fs'
import { Abortable } from 'node:events'
import { MockFiles, File } from './index'

export interface MockFSPromises {
  writeFile: (
    path: PathOrFileDescriptor,
    content: string | NodeJS.ArrayBufferView
  ) => void
  readFile: (
    path: PathLike,
    options?:
      | ({
          encoding?: null | undefined
          flag?: OpenMode | undefined
        } & Abortable)
      | null
  ) => Promise<string>
  access: (path: PathLike) => Promise<string | boolean>
}

const fsp = jest.createMockFromModule<MockFSPromises>('fs/promises')

let mockFiles: MockFiles = Object.create(null)

/**
 *
 * @param {Object} mf
 */
export function __cloneMockFilesFromFS(mf) {
  mockFiles = mf
}

/**
 * Clear mock files
 */
export function __clearMockFilesp() {
  mockFiles = {
    '.': [],
  }
}

/**
 * Mock file system
 * @param {Object} newMockFiles
 */
export function __setMockFilesp(newMockFiles) {
  mockFiles = Object.create(null)
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
}

/**
 * Get mock files
 * @return {Object} mockFiles
 */
export function __getMockFilesp() {
  return mockFiles
}

/**
 *
 * @param {PathOrFileDescriptor} filePath
 * @param {string | NodeJS.ArrayBufferView} content
 * @return {Promise.void}
 */
export const writeFile = jest.fn((filePath, content) => {
  const file = getFileByMockFS(filePath)

  if (file) {
    file.content = content
    return Promise.resolve(content)
  }
  return Promise.reject(new Error('file is not exist'))
})

/**
 *
 * @param {PathOrFileDescriptor} filePath
 * @return {Promise.void}
 */
export const readFile = jest.fn((filePath, options) => {
  const file = getFileByMockFS(filePath)

  if (file) {
    return Promise.resolve(file.content)
  }
  const error: Error & { code?: string } = {
    name: 'error',
    code: 'ENOENT',
    message: 'file is not exist',
  }
  return Promise.reject(error)
})

/**
 *
 * @param {PathOrFileDescriptor} filePath
 * @return {Promise.void}
 */
export const access = jest.fn(filePath => {
  const file = getFileByMockFS(filePath)
  if (file) {
    return Promise.resolve(true)
  }
  return Promise.reject(new Error('file is not exist'))
})

/**
 * getFileByMockFS
 * @param {String} filePath
 * @return {File | undefined}
 */
function getFileByMockFS(filePath: string): File | undefined {
  const dir = path.dirname(filePath)
  const file = path.basename(filePath)
  const f = (mockFiles[dir] || []).filter(item => item.file === file)
  if (f.length > 0) {
    return f[0]
  }
  return undefined
}

fsp.readFile = readFile
fsp.writeFile = writeFile
fsp.access = access
