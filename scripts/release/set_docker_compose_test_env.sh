#!/usr/bin/env bash
set -e

ENV="API_HOST=http://localhost:${FRONTEND_PORT}/"
echo "ENV=${ENV}" >>"${GITHUB_ENV}"
