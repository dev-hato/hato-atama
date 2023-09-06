#!/usr/bin/env bash

result="$(find . -type f -name "*.md" -not -path "./node_modules/*" -print0 | xargs -0 npx textlint 2>&1)" || true
echo "$result"
result="${result//'%'/'%25'}"
result="${result//$'\n'/'%0A'}"
result="${result//$'\r'/'%0D'}"
echo "result=$result" >>"${GITHUB_OUTPUT}"
true
