#!/usr/bin/env bash

npm ci
npm run test -- --env "${ENV}" --spec cypress/e2e/mini/*.cy.js --browser "${BROWSER_NAME}"
