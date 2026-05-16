#!/usr/bin/env bash
set -e

docker compose -f compose.yml -f dev.base.compose.yml pull
docker compose -f compose.yml -f dev.base.compose.yml up -d --wait
