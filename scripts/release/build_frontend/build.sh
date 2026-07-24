#!/usr/bin/env bash
set -e

# https://github.com/elm/compiler/blob/c51bdd69efb4b426539229aebf96be5fcb20fce3/installers/linux/README.md
elm_version="$(yq -oy '."elm-version"' elm.json)"
curl -L -o elm.gz "https://github.com/elm/compiler/releases/download/${elm_version}/elm-${elm_version}-linux-x64.gz"
gunzip elm.gz
chmod +x elm
mv elm /usr/local/bin/
npm ci
npm run build
