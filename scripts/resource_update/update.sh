#!/usr/bin/env bash
set -e

curl -fsSL https://raw.githubusercontent.com/AikidoSec/safe-chain/main/install-scripts/install-safe-chain.sh | sh -s -- --ci
npx npm-check-updates -u
npm install
