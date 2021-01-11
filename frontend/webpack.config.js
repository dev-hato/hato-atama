const HtmlWebpackPlugin = require('html-webpack-plugin')
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
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    hot: true,
    proxy: {
      '/api/': 'http://server:8082',
      '/l/': 'http://server:8082'
    }
  }
}
