#!/usr/bin/env bash

bash "${GITHUB_WORKSPACE}/scripts/release/run_docker_compose.sh"
docker compose -f compose.yml -f staging.compose.yml frontend nginx -t
