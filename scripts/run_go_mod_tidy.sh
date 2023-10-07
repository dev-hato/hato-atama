#!/usr/bin/env bash

go_version=$(yq '.runtime_config.runtime_version' app.yaml)
go mod tidy -go="${go_version}"
