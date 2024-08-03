#!/usr/bin/env bash

action="$(yq '.jobs.super-linter.steps[-1].uses' .github/workflows/super-linter.yml)"
PATH="$(docker run --rm --entrypoint '' "ghcr.io/${action//\/slim@/:slim-}" /bin/sh -c 'echo $PATH')"
echo "PATH=/github/workspace/node_modules/.bin:/github/workspace/test/e2e/node_modules/.bin:${PATH}" >>"$GITHUB_ENV"
