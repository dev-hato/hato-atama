#!/usr/bin/env bash

# https://github.com/elm/compiler/blob/24d3a89469e75cf7aa579442ecaf5ddfdd192ab2/installers/linux/README.md
elm_version="$(yq -oy '."elm-version"' elm.json)"
curl -L -o elm.gz "https://github.com/elm/compiler/releases/download/${elm_version}/binary-for-linux-64-bit.gz"
gunzip elm.gz
chmod +x elm
mv elm /usr/local/bin/
npm ci
npm run build
