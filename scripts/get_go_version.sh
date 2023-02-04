#!/usr/bin/env bash

docker compose -f compose.yml -f dev.compose.yml pull
DOCKER_CMD="go version | awk '{print \$3}' | sed -e 's/^go//g'"
go_version=$(docker compose -f compose.yml -f dev.compose.yml run server sh -c "${DOCKER_CMD}")
echo "Go version:" "${go_version}"
echo "go_version=${go_version}" >>"${GITHUB_OUTPUT}"
