#!/usr/bin/env bash

echo "$(go env GOPATH)/bin" >>"${GITHUB_PATH}"
go install golang.org/x/tools/cmd/goimports
