#!/usr/bin/env bash

sudo apt-get update
sudo apt-get install -y nkf

npm_version=$(yq '.engines.npm' package.json | sed -e 's/\^//g')
npm install --location=global "npm@${npm_version}"
npm ci

curl https://cloud.google.com/appengine/docs/standard/go/runtime | nkf -Lu > runtime.html
