#!/usr/bin/env bash

tag_name="$(yq '.jobs.super-linter.steps[-1].uses' .github/workflows/super-linter.yml | sed -e 's;/slim@.*;:slim;g')"
tag_version="$(yq '.jobs.super-linter.steps[-1].uses | line_comment' .github/workflows/super-linter.yml)"
PATH="$(docker run --rm --entrypoint '' "ghcr.io/${tag_name}-${tag_version}" /bin/sh -c 'echo $PATH')"
echo "PATH=/github/workspace/node_modules/.bin:/github/workspace/test/e2e/node_modules/.bin:${PATH}" >>"$GITHUB_ENV"
