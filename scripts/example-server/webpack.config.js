const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 8000,
    static: {
      publicPath: '/'
    }
  },
  devtool: 'source-map',
  entry: {
    bundle: path.resolve(__dirname, 'entry.js')
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward'
          }
        }
      },
      {
        test: /\.(gif|jpg|png)$/,
        use: 'file-loader'
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html')
    })
  ]
}
