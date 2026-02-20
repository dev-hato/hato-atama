#!/usr/bin/env bash
set -e

docker compose -f compose.yml -f base.compose.yml pull frontend
mapfile -t result < <(docker compose -f compose.yml -f base.compose.yml run frontend sh -c "${DOCKER_CMD}")
node_version="${result[0]//v/}"
echo "Node.js version:" "${node_version}"
echo "node_version=${node_version}" >>"${GITHUB_OUTPUT}"
