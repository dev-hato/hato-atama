#!/usr/bin/env bash
set -e

new_go_version=$(yq '.runtime' app.yaml | sed -e 's/go\([0-9]\)\([0-9]*\)/\1.\2/g')

if echo "$GO_VERSION" | grep "^$new_go_version"; then
	new_go_version=$GO_VERSION
fi

go mod tidy -go="${new_go_version}"
