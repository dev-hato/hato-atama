#!/usr/bin/env bash

ARTIFACT_PATH="${WORKSPACE}/tmp/artifacts"
echo "ARTIFACT_PATH=${ARTIFACT_PATH}" >>"$GITHUB_ENV"
URLS="https://"
URLS+="v${RUN_NUMBER}-dot-hato-atama.an.r.appspot.com"
echo "URLS=${URLS}" >>"${GITHUB_ENV}"
