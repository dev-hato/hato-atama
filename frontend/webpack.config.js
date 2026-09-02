const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("node:path");
const elmWatch = require("./elm-watch.json");

// 開発時（webpack serve）は elm.js を devServer.static が build/ から直接配信する。
// 本番ビルド時のみ CopyPlugin で dist/ にコピーする。
// 開発時にコピーすると elm-watch の再コンパイルが webpack のリビルドとフルリロードを誘発し、
// elm-watch の状態保持ホットリロードが効かなくなる。
const copyPatterns = [{ from: "public/", to: "." }];

if (!process.env.WEBPACK_SERVE) {
  copyPatterns.push({ from: elmWatch.targets.main.output, to: "elm.js" });
}

module.exports = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.[contenthash].js",
    clean: true,
  },
  plugins: [
    new CopyPlugin({ patterns: copyPatterns }),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
  ],
  devServer: {
    port: process.env.FRONTEND_PORT,
    host: "0.0.0.0",
    hot: true,
    static: {
      directory: path.resolve(__dirname, "build"),
      publicPath: "/",
      // build/elm.js の変更は elm-watch がホットリロードする。
      // webpack-dev-server が監視するとフルリロードになり状態保持が効かない。
      watch: false,
    },
    proxy: [
      {
        context: ["/api/", "/l/"],
        target: `http://server:${process.env.PORT}`,
      },
    ],
  },
};
