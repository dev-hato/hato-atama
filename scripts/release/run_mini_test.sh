#!/usr/bin/env bash
set -e

npm ci
bash "$(dirname "${BASH_SOURCE[0]}")/run_cypress.sh" --expose "${ENV}" --spec 'cypress/e2e/mini/*.cy.js' --browser "${BROWSER_NAME}"
