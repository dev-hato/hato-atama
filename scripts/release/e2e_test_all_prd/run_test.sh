#!/usr/bin/env bash

ENV="API_HOST="
ENV+="https://v${GITHUB_RUN_NUMBER}-dot-hato-atama.an.r.appspot.com"
echo "ENV=${ENV}" >>"${GITHUB_ENV}"
bash "${GITHUB_WORKSPACE}/scripts/release/run_test.sh"
