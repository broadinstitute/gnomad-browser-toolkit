// https://jestjs.io/docs/en/configuration.html

const fs = require('fs')
const path = require('path')

const packages = fs
  .readdirSync(path.join(__dirname, 'packages'), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

module.exports = {
  projects: [
    ...packages.map(pkg => ({
      displayName: pkg,
      testMatch: [`<rootDir>/packages/${pkg}/src/**/*.spec.js`],
      setupFilesAfterEnv: ['@testing-library/jest-dom'],
    })),
  ],
  roots: ['<rootDir>', '<rootDir>/tests'],
}
