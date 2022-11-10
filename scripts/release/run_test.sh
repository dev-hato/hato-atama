#!/usr/bin/env bash

npm ci
npm run test -- --env "${ENV}" --browser "${BROWSER_NAME}"
