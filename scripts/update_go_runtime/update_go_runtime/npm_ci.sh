#!/usr/bin/env bash

npm_version=$(grep \"npm\" package.json | sed -e 's/ *"npm": "^\(.*\)"/\1/g')
npm install --location=global "npm@${npm_version}"
npm ci
