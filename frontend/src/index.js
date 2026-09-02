"use strict";

const showLoadError = (reason) => {
  console.error("Elm アプリの初期化に失敗しました:", reason);
  const main = document.getElementById("main");
  if (main !== null) {
    main.textContent =
      "アプリの読み込みに失敗しました。ページを再読み込みしてください。";
  }
};

// dev では elm-watch が /elm.js を生成し終える前にページを開くと 404 になる。
// ビルド完了を待てるよう、開発ビルドに限って一定回数リトライする。
const isDev = process.env.NODE_ENV === "development";
let attempts = 0;
let elmScript = null;

// Elm 本体は elm-watch がビルドする /elm.js から読み込む。
// dev は webpack-dev-server が build/ ディレクトリを、本番は nginx が dist/elm.js を配信する。
// 読み込まれると window.Elm が生える。
const loadElm = () => {
  attempts += 1;

  // リトライ時に前回の <script> が head に残り続けないよう、常に1本だけにする。
  if (elmScript !== null) {
    elmScript.remove();
  }

  elmScript = document.createElement("script");
  // dev はリトライ時に 404 がキャッシュされないようクエリを付ける。
  elmScript.src = isDev ? `/elm.js?attempt=${attempts}` : "/elm.js";
  elmScript.addEventListener("load", () => {
    const main = document.getElementById("main");

    if (main === null) {
      showLoadError("#main 要素が見つかりません");
      return;
    }

    if (typeof window.Elm?.Main?.init !== "function") {
      showLoadError(
        "/elm.js は読み込めましたが window.Elm.Main.init が存在しません",
      );
      return;
    }

    try {
      window.Elm.Main.init({ node: main });
    } catch (error) {
      showLoadError(error);
    }
  });
  elmScript.addEventListener("error", () => {
    if (isDev && attempts < 20) {
      setTimeout(loadElm, 500);
      return;
    }

    showLoadError("/elm.js の読み込みに失敗しました");
  });
  document.head.appendChild(elmScript);
};

loadElm();
