#!/usr/bin/env bash
set -e

sudo chown -R 1000:1000 server/
cat .env >>"$GITHUB_ENV"
