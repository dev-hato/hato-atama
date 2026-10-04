#!/usr/bin/env bash
set -e

repo_path="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ncu_args=(-u)
# Updated together with Super-Linter by update-package.
if [ "${PWD}" = "${repo_path}" ]; then
	ncu_args+=(--reject "textlint,textlint-rule-*,textlint-filter-rule-*,@*/textlint-rule-*,@*/textlint-filter-rule-*")
elif [ "${PWD}" = "${repo_path}/test/e2e" ]; then
	ncu_args+=(--reject "eslint,eslint-plugin*")
fi

npx npm-check-updates "${ncu_args[@]}"
npm install
