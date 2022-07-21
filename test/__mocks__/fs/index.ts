import * as path from 'path'
import { PathLike } from 'fs'

export interface MockFS {
  __setMockFiles: (files: { [key: string]: string }) => void
  __clearMockFiles: () => void
  existsSync: (path: PathLike) => boolean
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

// /**
//  * Get mock files
//  * @return {Object} mockFiles
//  */
// export function __getMockFiles() {
//   return mockFiles
// }

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

  return mockFiles[dir].some(item => item.file === file)
})

fs.__setMockFiles = __setMockFiles
fs.__clearMockFiles = __clearMockFiles
fs.existsSync = existsSync
