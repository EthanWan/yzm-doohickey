import * as path from 'path'
import { PathLike } from 'fs'

export interface MockFS {
  __setMockFiles: (files: { [key: string]: string }) => void
  existsSync: (path: PathLike) => boolean
}

const fs = jest.createMockFromModule<MockFS>('fs')

let mockFiles = Object.create(null)

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
    mockFiles[dir].push(path.basename(file))
  }
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
 * Mock existsSync
 * @param {string} filePath
 * @return {boolean}
 */
export function existsSync(filePath) {
  const dir = path.dirname(filePath)
  const file = path.basename(filePath)

  return mockFiles[dir].includes(file)
}

fs.__setMockFiles = __setMockFiles
fs.existsSync = existsSync
