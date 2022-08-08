import * as path from 'path'
import { PathLike } from 'fs'

type Stats = {
  isFile(): boolean
  isDirectory(): boolean
}

export interface MockFS {
  __setMockFiles: (files: { [key: string]: string }) => void
  __clearMockFiles: () => void
  existsSync: (path: PathLike) => boolean
  stat: (
    path: PathLike,
    callback: (err: NodeJS.ErrnoException | null, stats: Stats) => void
  ) => void
}

const fs = jest.createMockFromModule<MockFS>('fs')

export type File = {
  file: string
  content: string
}

export interface MockFiles {
  [key: string]: File[]
}

let mockFiles = Object.create(null)

/**
 * Get mock files
 * @return {Object} mockFiles
 */
export function __getMockFiles() {
  return mockFiles
}

/**
 * Clear mock files
 */
export function __clearMockFiles() {
  mockFiles = {
    '.': [],
  }
}

/**
 * Mock file system
 * @param {Object} newMockFiles
 */
export function __setMockFiles(newMockFiles) {
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
 * Mock existsSync
 * @param {PathLike} filePath
 * @return {boolean}
 */
export const existsSync = jest.fn(filePath => {
  const dir = path.dirname(filePath)
  const file = path.basename(filePath)

  return (mockFiles[dir] || []).some(item => item.file === file)
})

/**
 * Mock stat
 * @param {PathLike} filePath
 * @param {Function} callback
 */
export const stat = jest.fn((filePath, cb) => {
  try {
    const dir = path.dirname(filePath)
    const file = path.basename(filePath)
    cb(null, {
      isDirectory: () => {
        return !!mockFiles[dir]
      },
      isFile: () => {
        return (mockFiles[dir] || []).some(item => item.file === file)
      },
    })
    mockFiles[dir]
  } catch (error) {
    cb(error, null)
  }
})

fs.__setMockFiles = __setMockFiles
fs.__clearMockFiles = __clearMockFiles
fs.existsSync = existsSync
fs.stat = stat
