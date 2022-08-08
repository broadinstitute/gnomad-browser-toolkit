module.exports = {
  coverageDirectory: 'coverage',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  preset: 'ts-jest',
  transform: {
    '.': 'ts-jest',
  },
}
