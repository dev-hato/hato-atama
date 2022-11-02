#!/usr/bin/env bash

ENV="API_HOST="
ENV+="https://v${GITHUB_RUN_NUMBER}-dot-hato-atama.an.r.appspot.com"
npm run test -- --env "${ENV}" --browser "${BROWSER_NAME}"
