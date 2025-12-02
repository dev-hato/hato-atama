#!/usr/bin/env bash
set -e

npm ci
npm run test -- --env "${ENV}" --browser "${BROWSER_NAME}"
