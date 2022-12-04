// https://jestjs.io/docs/configuration

module.exports = {
  bail: 1,

  transformIgnorePatterns: [
    'node_modules/(?!escape-string-regexp).+\\.(js|jsx)$',
  ]
};
