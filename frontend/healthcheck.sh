#!/bin/sh
set -e

# elm.js は elm-watch のコンパイル後に配信されるため、ここで 200 を確認することで
# Elm のビルドが完了するまで unhealthy に保つ
curl -f -s -S -o /dev/null "http://localhost:${FRONTEND_PORT}"
curl -f -s -S -o /dev/null "http://localhost:${FRONTEND_PORT}/elm.js"
