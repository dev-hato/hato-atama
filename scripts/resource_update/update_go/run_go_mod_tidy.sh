#!/usr/bin/env bash

go get -u ./...
bash "${GITHUB_WORKSPACE}/scripts/run_go_mod_tidy.sh"
