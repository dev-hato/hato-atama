#!/usr/bin/env bash

echo "$(go env GOPATH)/bin" >>"${GITHUB_PATH}"
go install golang.org/x/tools/cmd/goimports
bash "${GITHUB_WORKSPACE}/scripts/run_go_mod_tidy.sh"
goimports -l -w .
