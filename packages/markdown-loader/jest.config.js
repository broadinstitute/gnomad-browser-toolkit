/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  transform: {
    '.': 'ts-jest'
  },
  testPathIgnorePatterns: ['index.ts']
}
