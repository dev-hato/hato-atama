#!/usr/bin/env bash

docker compose -f docker-compose.yml -f base.docker-compose.yml pull frontend
mapfile -t result < <(docker compose -f docker-compose.yml -f base.docker-compose.yml run frontend sh -c "${DOCKER_CMD}")
node_version="${result[0]//v/}"
npm_version=${result[1]}
echo "Node.js version:" "${node_version}"
echo "npm version:" "${npm_version}"
echo "node_version=${node_version}" >>"${GITHUB_OUTPUT}"
echo "npm_version=${npm_version}" >>"${GITHUB_OUTPUT}"
