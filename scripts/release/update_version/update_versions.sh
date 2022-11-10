#!/usr/bin/env bash

docker compose -f docker-compose.yml -f base.docker-compose.yml pull frontend
mapfile -t result < <(docker compose -f docker-compose.yml -f base.docker-compose.yml run frontend sh -c "${DOCKER_CMD}")
node_version="${result[0]//v/}"
npm_version=${result[1]}
echo "Node.js version:" "${node_version}"
echo "npm version:" "${npm_version}"
NODE_VERSION="${node_version}"
NPM_VERSION="${npm_version}"

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
