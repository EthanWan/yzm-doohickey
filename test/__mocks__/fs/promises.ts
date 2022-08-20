import * as path from 'path'
import { PathLike } from 'fs'
import { OpenMode, PathOrFileDescriptor } from 'node:fs'
import { Abortable } from 'node:events'
import { MockFiles, File } from './index'

export interface MockFSPromises {
  writeFile: (
    path: PathOrFileDescriptor,
    content: string | NodeJS.ArrayBufferView
  ) => Promise<string | Error>
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
  mockFiles = Object.create(null)
}

/**
 * Mock file system
 * @param {Object} newMockFiles
 */
export function __setMockFilesp(newMockFiles: { [key: string]: string }) {
  mockFiles = Object.create(null)
  __addMockFilesp(newMockFiles)
}

/**
 * Add new mock files to file system
 * @param {Object} newMockFiles
 */
export function __addMockFilesp(newMockFiles: { [key: string]: string }) {
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

  try {
    if (file) {
      file.content = content
    } else {
      const dir = path.dirname(filePath)
      const file = path.basename(filePath)
      ;(mockFiles[dir] || []).push({
        file,
        content: content as string,
      })
    }
    return Promise.resolve(content)
  } catch (err) {
    return Promise.reject(new Error(err))
  }
})

/**
 * readFile
 * @param {PathOrFileDescriptor} filePath
 * @return {Promise.void}
 */
export const readFile = jest.fn((filePath, options) => {
  const file = getFileByMockFS(filePath)
  console.log(options)

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
 * access
 * @param {PathOrFileDescriptor} filePath
 * @return {Promise.void}
 */
export const access = jest.fn(filePath => {
  const dir = path.dirname(filePath)
  mockFiles[dir]
  if (Array.isArray(mockFiles[dir]) && dir !== '.') {
    return Promise.resolve(true)
  }
  const file = getFileByMockFS(filePath)
  if (file) {
    return Promise.resolve(true)
  }
  const error: Error & { code?: string } = {
    name: 'error',
    code: 'ENOENT',
    message: 'file or directory is not exist',
  }
  return Promise.reject(error)
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
