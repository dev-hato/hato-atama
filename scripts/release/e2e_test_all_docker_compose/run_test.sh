#!/usr/bin/env bash

ENV="API_HOST=http://localhost:${FRONTEND_PORT}/"
npm run test -- --env "${ENV}" --browser "${BROWSER_NAME}"
