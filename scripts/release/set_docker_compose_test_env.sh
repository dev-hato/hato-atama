#!/usr/bin/env bash

ENV="API_HOST=http://localhost:${FRONTEND_PORT}/"
echo "ENV=${ENV}" >>"${GITHUB_ENV}"
