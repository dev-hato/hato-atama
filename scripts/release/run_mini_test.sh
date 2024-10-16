#!/usr/bin/env bash

npm ci
apt-get update
apt-get install -y libdbus-glib-1-2
npm run test -- --env "${ENV}" --spec cypress/e2e/mini/*.cy.js --browser "${BROWSER_NAME}"
