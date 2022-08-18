const path = require('path')

const config = {
  presets: ['@babel/preset-typescript', '@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-proposal-class-properties', 'styled-components', 'inline-react-svg'],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
}

if (process.env.NODE_ENV === 'development') {
  config.plugins.push([
    'module-resolver',
    {
      alias: {
        '@resources': path.resolve(__dirname, './resources'),
      },
    },
  ])
}

module.exports = config
