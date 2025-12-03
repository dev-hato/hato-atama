#!/usr/bin/env bash
set -e

npm ci
npm run test -- --env "${ENV}" --spec cypress/e2e/mini/*.cy.js --browser "${BROWSER_NAME}"
