#!/usr/bin/env bash
set -e

go_version=$(yq '.runtime' app.yaml | sed -e 's/go\([0-9]\)\([0-9]*\)/\1.\2/g')
go mod tidy -go="${go_version}"
