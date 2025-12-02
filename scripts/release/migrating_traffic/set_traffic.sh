#!/usr/bin/env bash
set -e

VALUE="v${GITHUB_RUN_NUMBER}=1"
gcloud app services set-traffic default --splits "${VALUE}"
