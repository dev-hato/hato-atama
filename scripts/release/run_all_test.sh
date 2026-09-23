#!/usr/bin/env bash
set -e

npm ci
bash "$(dirname "${BASH_SOURCE[0]}")/run_cypress.sh" --env "${ENV}" --browser "${BROWSER_NAME}"
