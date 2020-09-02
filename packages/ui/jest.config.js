module.exports = {
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
}
