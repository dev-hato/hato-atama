#!/usr/bin/env bash

API_HOST="https://"
API_HOST+="v${GITHUB_RUN_NUMBER}-dot-hato-atama.an.r.appspot.com"
npm run test -- --env "API_HOST=${API_HOST}" \
  --spec cypress/e2e/mini/*.cy.js \
  --browser "${BROWSER_NAME}"
