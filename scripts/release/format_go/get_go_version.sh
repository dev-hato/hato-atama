#!/usr/bin/env bash

CMD="go version | awk '{print \$3}' | sed -e 's/^go//g'"
go_version=$(docker compose -f docker-compose.yml -f dev.docker-compose.yml run server sh -c "${CMD}")
echo "Go version:" "${go_version}"
echo "go_version=${go_version}" >>"${GITHUB_OUTPUT}"
