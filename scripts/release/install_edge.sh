#!/usr/bin/env bash
set -e

# GitHub ActionsランナーにプリインストールされているEdgeは自動更新され、Cypressとの接続が不安定になるバージョンが混ざることがある
# そのため、動作実績のある特定バージョンに固定してインストールする
EDGE_VERSION="150.0.4078.48-1"
DEB_FILE="microsoft-edge-stable_${EDGE_VERSION}_amd64.deb"
DEB_PATH="/tmp/${DEB_FILE}"

curl -fsSL --retry 3 --retry-delay 2 -o "${DEB_PATH}" "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/${DEB_FILE}"
sudo apt-get update
sudo dpkg -i "${DEB_PATH}"
