// Base copied from jest docs.
const path = require('path');

const fs = jest.createMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);

function setMockFiles(newMockFiles) {
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }

    mockFiles[dir].push(path.basename(file));
    if (typeof newMockFiles[file] === 'object' && !/\.js$/.test(path.basename(file))) {
      setMockFiles(newMockFiles[file]);
    }
  }
}

function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  setMockFiles(newMockFiles);
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(directoryPath) {
  return mockFiles[directoryPath] || [];
}

function lstatSync(targetPath) {
  return {
    isDirectory: () => typeof mockFiles[targetPath] === 'object'
  }
}

fs.__setMockFiles = __setMockFiles;
fs.__mockFiles = () => mockFiles;
fs.readdirSync = readdirSync;
fs.lstatSync = lstatSync;

module.exports = fs;