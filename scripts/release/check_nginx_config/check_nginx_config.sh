#!/usr/bin/env bash
set -e

bash "${GITHUB_WORKSPACE}/scripts/release/run_docker_compose.sh"
docker compose -f compose.yml -f staging.compose.yml exec frontend nginx -t
