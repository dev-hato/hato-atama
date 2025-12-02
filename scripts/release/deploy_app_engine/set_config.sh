#!/usr/bin/env bash
set -e

echo -e "env_variables:\n" >>app.yaml
echo -e "  ENV_NAME: \"v${GITHUB_RUN_NUMBER}\"" >>app.yaml
