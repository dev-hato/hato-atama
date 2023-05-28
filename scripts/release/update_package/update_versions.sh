#!/usr/bin/env bash

for path in "frontend" "test/e2e" "."; do
  echo "${NODE_VERSION}" >${path}/.node-version

  NODE_PATTERN="s/\"node\": \".*\"/\"node\": \"^${DEPENDABOT_NODE_VERSION}"

  if [ "${DEPENDABOT_NODE_VERSION}" != "${NODE_VERSION}" ]; then
    NODE_PATTERN+=" || ^${NODE_VERSION}"
  fi

  NODE_PATTERN+="\"/g"
  sed -i -e "${NODE_PATTERN}" ${path}/package.json

  NPM_PATTERN="s/\"npm\": \".*\"/\"npm\": \"^${DEPENDABOT_NPM_VERSION}"

  if [ "${DEPENDABOT_NPM_VERSION}" != "${NPM_VERSION}" ]; then
    NPM_PATTERN+=" || ^${NPM_VERSION}"
  fi

  NPM_PATTERN+="\"/g"
  sed -i -e "${NPM_PATTERN}" ${path}/package.json
done
