#!/usr/bin/env bash

npm_version=$(yq '.engines.npm' package.json | sed -e 's/\^//g')
npm install --location=global "npm@${npm_version}"
npm ci

sudo apt-get update
sudo apt-get install -y nkf

curl https://cloud.google.com/appengine/docs/standard/go/runtime | nkf -Lu > runtime.html
