#!/usr/bin/env bash

ENV="API_HOST=http://localhost:${FRONTEND_PORT}/"
bash "${GITHUB_WORKSPACE}/scripts/release/run_test.sh"
