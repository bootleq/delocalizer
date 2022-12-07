'use strict';

module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    webextensions: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  root: true,
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['tests/**'],
      extends: [
        'plugin:jest/recommended',
        'plugin:jest/style',
      ],
      env: {
        'jest/globals': true
      },
      rules: {
        'jest/prefer-to-have-length': 'warn',
        'jest/consistent-test-it': 'warn',
        'jest/prefer-hooks-in-order': 'warn',
        'jest/prefer-hooks-on-top': 'warn',
      }
    },
    {
      files: ['.eslintrc.js'],
      env: {
        node: true
      }
    }
  ]
};
