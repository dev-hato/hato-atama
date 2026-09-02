"use strict";

// Elm 本体は elm-watch がビルドする /elm.js から読み込む。
// dev は webpack-dev-server が build/ ディレクトリを、本番は nginx が dist/elm.js を配信する。
// 読み込まれると window.Elm が生える。
const elmScript = document.createElement("script");
elmScript.src = "/elm.js";
elmScript.addEventListener("load", () => {
  window.Elm.Main.init({
    node: document.getElementById("main"),
  });
});
document.head.appendChild(elmScript);
