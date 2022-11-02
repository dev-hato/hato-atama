#!/usr/bin/env bash

go_version=$(grep runtime app.yaml | sed -e 's/runtime: go\([0-9]\)\([0-9]*\)/\1.\2/g')
go mod tidy
goimports -l -w .
