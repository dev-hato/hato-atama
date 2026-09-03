// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

/* global Cypress */

// dev 環境のフロントエンドは elm-watch hot で動いており、実 JS を生成するまでの間 window.Elm のスタブ（Proxy）を配信する。
// この Proxy はプロパティアクセスで例外を投げ、直後に elm-watch がページを自動リロードして実 Elm に差し替える想定の挙動。
// elm-watch は識別用に error.elmWatchProxy = true を付けているので、この例外だけ無視する。
Cypress.on("uncaught:exception", (err) => err?.elmWatchProxy !== true);
