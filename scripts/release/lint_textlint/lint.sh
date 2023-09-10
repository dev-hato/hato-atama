#!/usr/bin/env bash

npm ci
find . -type f -name "*.md" -not -path "./node_modules/*" -print0 | xargs -0 npx textlint
