// import { PathLike } = require('fs')
const path = require('path')

// export interface MockFS {
//   __setMockFiles: (files: {[key: string]: string}) => void
//   existsSync: (path: PathLike) => boolean
// }

const fs = jest.createMockFromModule('fs')

let mockFiles = {};

function __setMockFiles(newMockFiles) {
  // console.log('-----', newMockFiles)
  console.log(mockFiles)
  mockFiles = {};
  for (const file in newMockFiles) {
    const dir = path.dirname(file);
    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

function existsSync(path) {
  return mockFiles.hasOwnProperty(path)
}

fs.__setMockFiles = __setMockFiles;
fs.existsSync = existsSync


module.exports = fs;
