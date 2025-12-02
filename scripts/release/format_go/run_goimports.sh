#!/usr/bin/env bash
set -e

echo "$(go env GOPATH)/bin" >>"${GITHUB_PATH}"
bash "${GITHUB_WORKSPACE}/scripts/run_go_mod_tidy.sh"
go install golang.org/x/tools/cmd/goimports
goimports -l -w .
