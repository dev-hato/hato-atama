#!/usr/bin/env bash
set -e

go get -u ./...
bash "${GITHUB_WORKSPACE}/scripts/run_go_mod_tidy.sh"
