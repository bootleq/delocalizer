module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          firefox: 57
        },
        modules: false
      }
    ],
    "@babel/preset-react"
  ]
};
