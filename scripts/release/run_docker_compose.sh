#!/usr/bin/env bash

docker compose -f compose.yml -f staging.compose.yml pull
docker compose -f compose.yml -f staging.compose.yml up -d --wait
