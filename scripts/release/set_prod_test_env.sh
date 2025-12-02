#!/usr/bin/env bash
set -e

ENV="API_HOST=https://v${GITHUB_RUN_NUMBER}-dot-hato-atama.an.r.appspot.com"
echo "ENV=${ENV}" >>"${GITHUB_ENV}"
