#!/usr/bin/env bash

npm run test -- --env "API_HOST=http://localhost:${FRONTEND_PORT}/" \
  --spec cypress/e2e/mini/*.cy.js \
  --browser "${BROWSER_NAME}"
