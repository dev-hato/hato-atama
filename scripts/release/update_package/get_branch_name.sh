#!/usr/bin/env bash

BRANCH_NAME="${DIRECTORY//\//-}"
BRANCH_NAME="${BRANCH_NAME//\./root}"
echo "branch_name=${BRANCH_NAME}" >>"${GITHUB_OUTPUT}"
