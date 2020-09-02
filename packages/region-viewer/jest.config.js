module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
}
