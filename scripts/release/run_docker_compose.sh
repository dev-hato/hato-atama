#!/usr/bin/env bash

cat .env >>"$GITHUB_ENV"
docker compose -f docker-compose.yml -f staging.docker-compose.yml pull
docker compose -f docker-compose.yml -f staging.docker-compose.yml up -d --wait
