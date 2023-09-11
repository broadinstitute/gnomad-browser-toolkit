const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'MarkdownLoaderExample.js'),
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(gif|jpg|png)$/,
        use: 'file-loader',
      },
      {
        test: /\.md$/,
        use: path.resolve(__dirname, '..'),
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new HtmlWebpackPlugin(),
  ],
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
    },
  },
}
