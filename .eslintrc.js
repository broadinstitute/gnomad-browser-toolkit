module.exports = {
  extends: [
    'airbnb',
    'airbnb/hooks',
    'prettier',
    'prettier/react',
    'plugin:cypress/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  env: {
    browser: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', '@typescript-eslint', 'cypress'],
  rules: {
    'prettier/prettier': 'error',
    'func-names': ['warn', 'as-needed'],
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 0,
    // https://github.com/airbnb/javascript/blob/6d05dd898acfec3299cc2be8b6188be542824965/packages/eslint-config-airbnb/rules/react.js#L489
    'react/static-property-placement': ['error', 'static public field'],
    // Does not handle initial state derived from props in constructor
    'react/state-in-constructor': 'off',
    // TODO: Use shorthand
    'react/jsx-fragments': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        // Allow absence of file extensions on these imports:
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never'
      }
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
    'react/forbid-prop-types': 'off',
    'import/order': 'off',
    'react/no-unescaped-entities': 'off',
    'react/destructuring-assignment': 'off'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint'
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react/no-array-index-key': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-restricted-syntax': 'off',
        'react/jsx-filename-extension': 'off',
        'react/prop-types': 'off'
      }
    },
    {
      // Set environment for tests
      files: [
        '**/*spec.[jt]s',
        '**/*test.[jt]s',
        '**/__tests__/**/*.[jt]s',
        '**/__mocks__/**/*.[jt]s'
      ],
      env: {
        jest: true
      }
    },
    {
      // Allow importing from resources only in package examples
      files: ['packages/**/example/*.js'],
      rules: {
        'import/no-unresolved': ['error', { ignore: ['^@resources/'] }]
      }
    }
  ],
  parserOptions: {
    ecmaVersion: '2018'
  }
}
