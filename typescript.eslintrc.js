module.exports = {
  parser: '@typescript-eslint/parser',
  root: true,
  plugins: ['@typescript-eslint'],
  rules: {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-restricted-syntax': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/no-array-index-key': 'off',
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
}
