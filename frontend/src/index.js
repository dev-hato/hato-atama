"use strict";

const showLoadError = (reason) => {
  console.error("Elm アプリの初期化に失敗しました:", reason);
  const main = document.getElementById("main");
  if (main !== null) {
    main.textContent =
      "アプリの読み込みに失敗しました。ページを再読み込みしてください。";
  }
};

// Elm 本体は elm-watch がビルドする /elm.js から読み込む。
// dev は webpack-dev-server が build/ ディレクトリを、本番は nginx が dist/elm.js を配信する。
// 読み込まれると window.Elm が生える。
const elmScript = document.createElement("script");
elmScript.src = "/elm.js";
elmScript.addEventListener("load", () => {
  const main = document.getElementById("main");

  if (main === null) {
    showLoadError("#main 要素が見つかりません");
    return;
  }

  if (typeof window.Elm?.Main?.init !== "function") {
    showLoadError("/elm.js は読み込めましたが window.Elm.Main.init が存在しません");
    return;
  }

  try {
    window.Elm.Main.init({ node: main });
  } catch (error) {
    showLoadError(error);
  }
});
elmScript.addEventListener("error", () => {
  showLoadError("/elm.js の読み込みに失敗しました");
});
document.head.appendChild(elmScript);
