const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/i,
        exclude: [/elm-stuff/, /node_modules/],
        loader: 'html-loader'
      },
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],

        use: [
          {
            loader: 'elm-webpack-loader',
            options: {
              cwd: __dirname
            }
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.[contenthash].js'
  },
  plugins: [
    new CopyPlugin({ patterns: [{ from: 'public/', to: '.' }] }),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    port: process.env.FRONTEND_PORT,
    host: '0.0.0.0',
    hot: true,
    proxy: {
      '/api/': 'http://server:' + process.env.PORT,
      '/l/': 'http://server:' + process.env.PORT
    }
  }
}
