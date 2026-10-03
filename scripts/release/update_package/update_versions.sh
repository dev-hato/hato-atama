#!/usr/bin/env bash
set -e

for path in "frontend" "test/e2e" "."; do
	echo "${NODE_VERSION}" >${path}/.node-version

	NODE_PATTERN="s/\"node\": \".*\"/\"node\": \"^${DEPENDABOT_NODE_VERSION}"

	if [ "${DEPENDABOT_NODE_VERSION}" != "${NODE_VERSION}" ]; then
		NODE_PATTERN+=" || ^${NODE_VERSION}"
	fi

	NODE_PATTERN+="\"/g"
	sed -i -e "${NODE_PATTERN}" ${path}/package.json
done
