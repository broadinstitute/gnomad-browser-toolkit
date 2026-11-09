module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }]
  },
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['/node_modules/', '/src/testUtils.tsx$']
}
