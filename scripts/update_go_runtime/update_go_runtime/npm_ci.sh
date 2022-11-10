#!/usr/bin/env bash

npm_version=$(yq '.engines.npm' package.json | sed -e 's/\^//g')
npm install --location=global "npm@${npm_version}"
npm ci
