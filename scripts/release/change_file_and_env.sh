#!/usr/bin/env bash

sudo chown -R 1000:1000 server/
cat .env >>"$GITHUB_ENV"
